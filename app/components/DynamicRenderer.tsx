"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Player } from "@remotion/player";
import * as RemotionLib from "remotion";
import * as RemotionMedia from "@remotion/media";
import * as RemotionSfx from "@remotion/sfx";
import * as RemotionTransitions from "@remotion/transitions";
import * as RemotionTransitionsFade from "@remotion/transitions/fade";
import * as RemotionTransitionsSlide from "@remotion/transitions/slide";
import * as RemotionPaths from "@remotion/paths";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { transform } from "sucrase";
import type { CaptionWord } from "@/src/types";

const MODULE_MAP: Record<string, unknown> = {
  "react": React,
  "remotion": RemotionLib,
  "@remotion/media": RemotionMedia,
  "@remotion/sfx": RemotionSfx,
  "@remotion/transitions": RemotionTransitions,
  "@remotion/transitions/fade": RemotionTransitionsFade,
  "@remotion/transitions/slide": RemotionTransitionsSlide,
  "@remotion/paths": RemotionPaths,
};

/**
 * Compile AI-generated React/Remotion code into a usable component.
 * The code should export a default React component.
 */
function compileComponent(code: string): React.FC {
  // Transform JSX + TypeScript + imports → CommonJS
  const result = transform(code, {
    transforms: ["jsx", "typescript", "imports"],
    jsxRuntime: "classic", // Use React.createElement
  });

  const transformedCode = result.code;

  // Create sandbox module
  const moduleObj: { exports: Record<string, unknown> } = { exports: {} };

  const requireFn = (mod: string): unknown => {
    const resolved = MODULE_MAP[mod];
    if (resolved) return resolved;
    throw new Error(`Module "${mod}" is not available in sandbox`);
  };

  // Execute in sandbox
  const factory = new Function(
    "module",
    "exports",
    "require",
    "React",
    transformedCode,
  );
  factory(moduleObj, moduleObj.exports, requireFn, React);

  const Component = (moduleObj.exports.default ||
    moduleObj.exports.MyComposition ||
    moduleObj.exports.Video) as React.FC;

  if (typeof Component !== "function") {
    throw new Error(
      "Generated code must export a default React component function",
    );
  }

  return Component;
}

// Error boundary for catching render errors in dynamic components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 24,
            background: "#1c1017",
            borderRadius: 12,
            border: "1px solid #7f1d1d",
          }}
        >
          <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600 }}>
            Render Error
          </p>
          <pre
            style={{
              color: "#fca5a5",
              fontSize: 12,
              marginTop: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Caption overlay for dynamic compositions — TikTok-style word highlighting.
 */
const CAPTION_SWITCH_MS = 800;
const DynamicCaptionOverlay: React.FC<{ captions: CaptionWord[] }> = ({ captions }) => {
  const frame = RemotionLib.useCurrentFrame();
  const { fps } = RemotionLib.useVideoConfig();

  const { pages } = useMemo(
    () => createTikTokStyleCaptions({
      captions: captions.map((c) => ({
        text: c.text,
        startMs: c.startMs,
        endMs: c.endMs,
        timestampMs: c.timestampMs,
        confidence: c.confidence,
      })),
      combineTokensWithinMilliseconds: CAPTION_SWITCH_MS,
    }),
    [captions],
  );

  const currentTimeMs = (frame / fps) * 1000;
  const currentPage = pages.find((page, i) => {
    const nextPage = pages[i + 1] ?? null;
    const pageEndMs = nextPage ? nextPage.startMs : page.startMs + CAPTION_SWITCH_MS;
    return currentTimeMs >= page.startMs && currentTimeMs < pageEndMs;
  });

  if (!currentPage) return null;

  return React.createElement(
    RemotionLib.AbsoluteFill,
    { style: { justifyContent: "flex-end", alignItems: "center", paddingBottom: 60 } },
    React.createElement(
      "div",
      {
        style: {
          fontSize: 42, fontWeight: 700, whiteSpace: "pre" as const, textAlign: "center" as const,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          maxWidth: "80%", lineHeight: 1.4,
        },
      },
      ...currentPage.tokens.map((token) => {
        const isActive = token.fromMs <= currentTimeMs && token.toMs > currentTimeMs;
        return React.createElement("span", {
          key: token.fromMs,
          style: {
            color: isActive ? "#FFD700" : "rgba(255,255,255,0.95)",
            textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
          },
        }, token.text);
      }),
    ),
  );
};

/**
 * Creates a wrapper that combines the dynamic component with audio + captions.
 */
function createWrapped(
  InnerComp: React.FC,
  audioUrl?: string,
  captions?: CaptionWord[],
): React.FC {
  const Wrapped: React.FC = () => {
    const children: React.ReactElement[] = [
      React.createElement(InnerComp, { key: "inner" }),
    ];
    if (audioUrl) {
      children.push(
        React.createElement(RemotionLib.Audio, { key: "audio", src: audioUrl, volume: 1 }),
      );
    }
    if (captions && captions.length > 0) {
      children.push(
        React.createElement(DynamicCaptionOverlay, { key: "captions", captions }),
      );
    }
    return React.createElement(RemotionLib.AbsoluteFill, null, ...children);
  };
  return Wrapped;
}

type DynamicRendererProps = {
  code: string;
  durationInFrames: number;
  audioUrl?: string;
  captions?: CaptionWord[];
  fps?: number;
  width?: number;
  height?: number;
};

export default function DynamicRenderer({
  code,
  durationInFrames,
  audioUrl,
  captions,
  fps = 30,
  width = 1920,
  height = 1080,
}: DynamicRendererProps) {
  const [compileError, setCompileError] = useState<string | null>(null);

  const CompiledComponent = useMemo(() => {
    if (!code) return null;
    try {
      setCompileError(null);
      const InnerComp = compileComponent(code);
      if (audioUrl || (captions && captions.length > 0)) {
        return createWrapped(InnerComp, audioUrl, captions);
      }
      return InnerComp;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown compilation error";
      setCompileError(msg);
      return null;
    }
  }, [code, audioUrl, captions]);

  // Reset error boundary when code changes
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((k) => k + 1);
  }, [code]);

  if (compileError) {
    return (
      <div
        style={{
          padding: 24,
          background: "#1c1017",
          borderRadius: 12,
          border: "1px solid #7f1d1d",
        }}
      >
        <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600 }}>
          Compilation Error
        </p>
        <pre
          style={{
            color: "#fca5a5",
            fontSize: 12,
            marginTop: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {compileError}
        </pre>
      </div>
    );
  }

  if (!CompiledComponent) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#71717a",
          fontSize: 14,
        }}
      >
        No component to render
      </div>
    );
  }

  return (
    <ErrorBoundary key={key} fallback={<div>Render failed</div>}>
      <Player
        component={CompiledComponent}
        durationInFrames={durationInFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={fps}
        style={{ width: "100%", borderRadius: 12, overflow: "hidden" }}
        controls
      />
    </ErrorBoundary>
  );
}
