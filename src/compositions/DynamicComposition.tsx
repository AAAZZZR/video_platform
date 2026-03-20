import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import * as RemotionLib from "remotion";
import * as RemotionMedia from "@remotion/media";
import * as RemotionSfx from "@remotion/sfx";
import * as RemotionTransitions from "@remotion/transitions";
import * as RemotionTransitionsFade from "@remotion/transitions/fade";
import * as RemotionTransitionsSlide from "@remotion/transitions/slide";
import * as RemotionPaths from "@remotion/paths";
import { transform } from "sucrase";

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

function compileComponent(code: string): React.FC {
  const result = transform(code, {
    transforms: ["jsx", "typescript", "imports"],
    jsxRuntime: "classic",
  });

  const transformedCode = result.code;
  const moduleObj: { exports: Record<string, unknown> } = { exports: {} };

  const requireFn = (mod: string): unknown => {
    const resolved = MODULE_MAP[mod];
    if (resolved) return resolved;
    throw new Error(`Module "${mod}" is not available in sandbox`);
  };

  const factory = new Function("module", "exports", "require", "React", transformedCode);
  factory(moduleObj, moduleObj.exports, requireFn, React);

  const Component = (moduleObj.exports.default ||
    moduleObj.exports.MyComposition ||
    moduleObj.exports.Video) as React.FC;

  if (typeof Component !== "function") {
    throw new Error("Generated code must export a default React component");
  }

  return Component;
}

export type DynamicCompositionProps = {
  code: string;
  audioUrl?: string;
  durationInFrames?: number;
};

export const DynamicComposition: React.FC<DynamicCompositionProps> = ({
  code,
  audioUrl,
}) => {
  const Component = useMemo(() => {
    try {
      return compileComponent(code);
    } catch (e) {
      console.error("Failed to compile dynamic code:", e);
      return null;
    }
  }, [code]);

  if (!Component) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#f87171", fontSize: 24 }}>Failed to compile component</p>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Component />
      {audioUrl && <RemotionLib.Audio src={audioUrl} volume={1} />}
    </AbsoluteFill>
  );
};
