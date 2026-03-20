import "./index.css";
import React from "react";
import { Composition } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { SceneVideo } from "./compositions/SceneVideo";
import { DynamicComposition, type DynamicCompositionProps } from "./compositions/DynamicComposition";
import {
  calculateTotalDuration,
  FPS,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  type SceneVideoProps,
  type SceneData,
} from "./types";

const calculateMetadata: CalculateMetadataFunction<SceneVideoProps> = ({
  props,
}) => {
  return {
    durationInFrames: calculateTotalDuration(props.scenes),
    fps: FPS,
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  };
};

const calculateDynamicMetadata: CalculateMetadataFunction<DynamicCompositionProps> = ({
  props,
}) => {
  // Use explicit prop if passed from render API
  let duration = props.durationInFrames;

  // Fallback: extract from code comment // DURATION: XXX
  if (!duration && props.code) {
    const match = props.code.match(/\/\/\s*DURATION:\s*(\d+)/);
    if (match) duration = parseInt(match[1], 10);
  }

  return {
    durationInFrames: duration || 300,
    fps: FPS,
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  };
};

const defaultScenes: SceneData[] = [
  {
    type: "title",
    title: "Welcome to VidCraft AI",
    subtitle: "Create stunning videos with the power of artificial intelligence",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    durationInFrames: 120,
  },
  {
    type: "bullets",
    title: "Key Features",
    items: [
      "AI-powered script generation",
      "9 scene types: charts, tables, code & more",
      "Cloud rendering on AWS Lambda",
      "Export in stunning 1080p HD",
    ],
    background:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    durationInFrames: 150,
  },
  {
    type: "stats",
    title: "Performance",
    items: [
      { value: "10s", label: "Render Time" },
      { value: "1080p", label: "Resolution" },
      { value: "9", label: "Scene Types" },
    ],
    background:
      "linear-gradient(135deg, #2d1b69 0%, #1a1a2e 100%)",
    durationInFrames: 150,
  },
  {
    type: "quote",
    title: "",
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    background:
      "linear-gradient(135deg, #0a192f 0%, #112240 50%, #1d3557 100%)",
    durationInFrames: 120,
  },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SceneVideo"
        component={SceneVideo}
        durationInFrames={300}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={
          {
            scenes: defaultScenes,
          } satisfies SceneVideoProps
        }
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="DynamicVideo"
        component={DynamicComposition}
        durationInFrames={300}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          code: "import React from 'react';\nimport { AbsoluteFill } from 'remotion';\nexport default () => <AbsoluteFill style={{backgroundColor:'#0a0a0a'}}/>",
        } satisfies DynamicCompositionProps}
        calculateMetadata={calculateDynamicMetadata}
      />
    </>
  );
};
