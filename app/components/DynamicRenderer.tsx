"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Player } from "@remotion/player";
import * as RemotionLib from "remotion";
import { transform } from "sucrase";

// All Remotion APIs available to AI-generated code
const REMOTION_EXPORTS = RemotionLib;

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
    if (mod === "react") return React;
    if (mod === "remotion") return REMOTION_EXPORTS;
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
 * Creates a wrapper component that plays audio alongside the dynamic component.
 */
function createWithAudio(InnerComp: React.FC, audioUrl: string): React.FC {
  const Wrapped: React.FC = () => {
    return React.createElement(
      RemotionLib.AbsoluteFill,
      null,
      React.createElement(InnerComp),
      React.createElement(RemotionLib.Audio, { src: audioUrl, volume: 1 }),
    );
  };
  return Wrapped;
}

type DynamicRendererProps = {
  code: string;
  durationInFrames: number;
  audioUrl?: string;
  fps?: number;
  width?: number;
  height?: number;
};

export default function DynamicRenderer({
  code,
  durationInFrames,
  audioUrl,
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
      if (audioUrl) {
        return createWithAudio(InnerComp, audioUrl);
      }
      return InnerComp;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown compilation error";
      setCompileError(msg);
      return null;
    }
  }, [code, audioUrl]);

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
