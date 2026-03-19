import React from "react";
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type {
  SceneData,
  SceneVideoProps,
  TitleScene,
  TextScene,
  BulletsScene,
  TableScene,
  ChartBarScene,
  StatsScene,
  ComparisonScene,
  QuoteScene,
  CodeScene,
} from "@/src/types";
import { TRANSITION_FRAMES } from "@/src/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const MONO_FONT =
  '"SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
const STAGGER_DELAY = 6;
const SCENE_PADDING = 90;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Global fade envelope: fade in over first 0.4s, out over last 0.4s */
function useSceneOpacity(durationInFrames: number): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeFrames = Math.floor(fps * 0.4);
  const fadeOutStart = durationInFrames - fadeFrames;
  return interpolate(
    frame,
    [0, fadeFrames, Math.max(fadeFrames, fadeOutStart), durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

/** Wrapper that applies background + padding + fade envelope to every scene */
const SceneContainer: React.FC<{
  background: string;
  durationInFrames: number;
  audioUrl?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ background, durationInFrames, audioUrl, children, style }) => {
  const opacity = useSceneOpacity(durationInFrames);
  return (
    <AbsoluteFill
      style={{
        background,
        padding: SCENE_PADDING,
        fontFamily: FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        ...style,
      }}
    >
      {audioUrl && <Audio src={audioUrl} volume={1} />}
      <div style={{ opacity, width: "100%", height: "100%" }}>{children}</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 1. Title Scene
// ---------------------------------------------------------------------------

const TitleSlide: React.FC<{ scene: TitleScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(
    spring({ frame, fps, delay: 10, config: { damping: 200 } }),
    [0, 1],
    [0, 160],
  );

  const subtitleOpacity = interpolate(frame, [18, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [18, 32], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: 90,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: 0,
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            maxWidth: 1400,
          }}
        >
          {scene.title}
        </h1>

        <div
          style={{
            width: lineWidth,
            height: 4,
            background: "rgba(255,255,255,0.5)",
            borderRadius: 2,
            margin: "32px auto",
          }}
        />

        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 38,
            fontWeight: 400,
            lineHeight: 1.5,
            margin: 0,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            maxWidth: 1000,
          }}
        >
          {scene.subtitle}
        </p>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// 2. Text Scene
// ---------------------------------------------------------------------------

const TextSlide: React.FC<{ scene: TextScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const bodyOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bodyY = interpolate(frame, [14, 28], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "0 0 40px 0",
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}
        >
          {scene.title}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 34,
            fontWeight: 400,
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 1200,
            opacity: bodyOpacity,
            transform: `translateY(${bodyY}px)`,
          }}
        >
          {scene.body}
        </p>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// 3. Bullets Scene
// ---------------------------------------------------------------------------

const BulletsSlide: React.FC<{ scene: BulletsScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  const bulletColors = [
    "#6C63FF",
    "#FF6584",
    "#43E97B",
    "#F7971E",
    "#00C9FF",
    "#FC5C7D",
    "#A18CD1",
    "#FF9A9E",
  ];

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: 60,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 48px 0",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {scene.title}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {scene.items.map((item, i) => {
            const s = spring({
              frame,
              fps,
              delay: 8 + i * STAGGER_DELAY,
              config: { damping: 200 },
            });
            const x = interpolate(s, [0, 1], [-60, 0]);
            const o = interpolate(s, [0, 1], [0, 1]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  opacity: o,
                  transform: `translateX(${x}px)`,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: bulletColors[i % bulletColors.length],
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 32,
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// 4. Table Scene
// ---------------------------------------------------------------------------

const TableSlide: React.FC<{ scene: TableScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  const headerProgress = spring({
    frame,
    fps,
    delay: 8,
    config: { damping: 200 },
  });
  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1]);

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 40px 0",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {scene.title}
        </h2>

        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.12)",
              opacity: headerOpacity,
            }}
          >
            {scene.headers.map((h, ci) => (
              <div
                key={ci}
                style={{
                  flex: 1,
                  padding: "20px 28px",
                  color: "white",
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {scene.rows.map((row, ri) => {
            const rowProgress = spring({
              frame,
              fps,
              delay: 14 + ri * STAGGER_DELAY,
              config: { damping: 200 },
            });
            const rowOpacity = interpolate(rowProgress, [0, 1], [0, 1]);
            const rowY = interpolate(rowProgress, [0, 1], [20, 0]);

            return (
              <div
                key={ri}
                style={{
                  display: "flex",
                  background:
                    ri % 2 === 0
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(255,255,255,0.07)",
                  opacity: rowOpacity,
                  transform: `translateY(${rowY}px)`,
                }}
              >
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    style={{
                      flex: 1,
                      padding: "18px 28px",
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 22,
                      fontWeight: 400,
                    }}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// 5. Chart-Bar Scene
// ---------------------------------------------------------------------------

const ChartBarSlide: React.FC<{ scene: ChartBarScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  const maxVal =
    scene.maxValue ??
    Math.max(...scene.items.map((d) => d.value), 1);

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 48px 0",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {scene.title}
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 32,
            height: 400,
            paddingTop: 20,
          }}
        >
          {scene.items.map((item, i) => {
            const barSpring = spring({
              frame,
              fps,
              delay: 10 + i * STAGGER_DELAY,
              config: { damping: 200 },
            });
            const heightPct = (item.value / maxVal) * 100;
            const barHeight = interpolate(barSpring, [0, 1], [0, heightPct]);
            const labelOpacity = interpolate(barSpring, [0, 0.6, 1], [0, 0, 1]);

            const displayValue = Math.round(
              interpolate(barSpring, [0, 1], [0, item.value]),
            );

            const barColors = [
              "#6C63FF",
              "#FF6584",
              "#43E97B",
              "#F7971E",
              "#00C9FF",
              "#FC5C7D",
              "#A18CD1",
              "#FF9A9E",
            ];

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "100%",
                }}
              >
                {/* Value label */}
                <span
                  style={{
                    color: "white",
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 8,
                    opacity: labelOpacity,
                  }}
                >
                  {displayValue}
                  {scene.unit ?? ""}
                </span>

                {/* Bar */}
                <div
                  style={{
                    width: "70%",
                    height: `${barHeight}%`,
                    background: barColors[i % barColors.length],
                    borderRadius: "8px 8px 0 0",
                    minHeight: 4,
                  }}
                />

                {/* Label */}
                <span
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 18,
                    fontWeight: 500,
                    marginTop: 12,
                    textAlign: "center",
                    opacity: labelOpacity,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// 6. Stats Scene
// ---------------------------------------------------------------------------

const StatsSlide: React.FC<{ scene: StatsScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 60px 0",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
          }}
        >
          {scene.title}
        </h2>

        <div
          style={{
            display: "flex",
            gap: 80,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {scene.items.map((stat, i) => {
            const s = spring({
              frame,
              fps,
              delay: 10 + i * STAGGER_DELAY,
              config: { damping: 20, stiffness: 200 },
            });
            const scale = interpolate(s, [0, 1], [0.3, 1]);
            const o = interpolate(s, [0, 1], [0, 1]);
            const labelO = interpolate(
              frame,
              [20 + i * STAGGER_DELAY, 30 + i * STAGGER_DELAY],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: o,
                  transform: `scale(${scale})`,
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: 110,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 24,
                    fontWeight: 500,
                    marginTop: 16,
                    opacity: labelO,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// 7. Comparison Scene
// ---------------------------------------------------------------------------

const ComparisonSlide: React.FC<{ scene: ComparisonScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  const dividerHeight = interpolate(
    spring({ frame, fps, delay: 8, config: { damping: 200 } }),
    [0, 1],
    [0, 100],
  );

  const renderColumn = (
    colTitle: string,
    items: string[],
    color: string,
    side: "left" | "right",
  ) => {
    const colTitleS = spring({
      frame,
      fps,
      delay: 10,
      config: { damping: 200 },
    });
    const colTitleO = interpolate(colTitleS, [0, 1], [0, 1]);

    return (
      <div style={{ flex: 1 }}>
        <h3
          style={{
            color,
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 32,
            opacity: colTitleO,
            textAlign: "center",
          }}
        >
          {colTitle}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {items.map((item, i) => {
            const baseDelay = side === "left" ? 16 : 18;
            const s = spring({
              frame,
              fps,
              delay: baseDelay + i * STAGGER_DELAY,
              config: { damping: 200 },
            });
            const x = interpolate(
              s,
              [0, 1],
              [side === "left" ? -40 : 40, 0],
            );
            const o = interpolate(s, [0, 1], [0, 1]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: o,
                  transform: `translateX(${x}px)`,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 26,
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 48px 0",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
          }}
        >
          {scene.title}
        </h2>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          {renderColumn(scene.leftTitle, scene.leftItems, "#43E97B", "left")}

          {/* Divider */}
          <div
            style={{
              width: 2,
              height: `${dividerHeight}%`,
              background: "rgba(255,255,255,0.2)",
              margin: "0 40px",
              alignSelf: "center",
              borderRadius: 1,
            }}
          />

          {renderColumn(
            scene.rightTitle,
            scene.rightItems,
            "#FF6584",
            "right",
          )}
        </div>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// 8. Quote Scene
// ---------------------------------------------------------------------------

const QuoteSlide: React.FC<{ scene: QuoteScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quoteMarkO = interpolate(
    spring({ frame, fps, config: { damping: 200 } }),
    [0, 1],
    [0, 1],
  );

  const textO = interpolate(frame, [10, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(frame, [10, 26], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const authorO = interpolate(frame, [24, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorY = interpolate(frame, [24, 38], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Decorative quotation mark */}
        <span
          style={{
            fontSize: 200,
            color: "rgba(255,255,255,0.1)",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            position: "absolute",
            top: "10%",
            left: 0,
            opacity: quoteMarkO,
            userSelect: "none",
          }}
        >
          {"\u201C"}
        </span>

        <p
          style={{
            color: "white",
            fontSize: 40,
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 1.6,
            margin: 0,
            opacity: textO,
            transform: `translateY(${textY}px)`,
          }}
        >
          {scene.quote}
        </p>

        <div
          style={{
            width: 60,
            height: 3,
            background: "rgba(255,255,255,0.3)",
            borderRadius: 2,
            margin: "32px auto",
            opacity: authorO,
          }}
        />

        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 28,
            fontWeight: 600,
            margin: 0,
            opacity: authorO,
            transform: `translateY(${authorY}px)`,
          }}
        >
          {scene.author}
        </p>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// 9. Code Scene
// ---------------------------------------------------------------------------

const CodeSlide: React.FC<{ scene: CodeScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  const blockO = interpolate(
    spring({ frame, fps, delay: 8, config: { damping: 200 } }),
    [0, 1],
    [0, 1],
  );

  // Typewriter: reveal characters over time
  const charsPerFrame = 2;
  const typewriterStart = 14;
  const visibleChars = Math.floor(
    Math.max(0, (frame - typewriterStart) * charsPerFrame),
  );
  const displayedCode = scene.code.slice(
    0,
    Math.min(visibleChars, scene.code.length),
  );

  // Blinking cursor
  const cursorVisible =
    visibleChars < scene.code.length ? Math.floor(frame / 8) % 2 === 0 : false;

  return (
    <SceneContainer
      background={scene.background}
      durationInFrames={scene.durationInFrames}
      audioUrl={scene.audioUrl}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 36px 0",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {scene.title}
        </h2>

        <div
          style={{
            background: "#1e1e2e",
            borderRadius: 16,
            padding: "28px 36px",
            position: "relative",
            opacity: blockO,
            overflow: "hidden",
          }}
        >
          {/* Language label */}
          <span
            style={{
              position: "absolute",
              top: 14,
              right: 20,
              color: "rgba(255,255,255,0.35)",
              fontSize: 14,
              fontFamily: MONO_FONT,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {scene.language}
          </span>

          {/* Code content */}
          <pre
            style={{
              margin: 0,
              fontFamily: MONO_FONT,
              fontSize: 22,
              lineHeight: 1.7,
              color: "#e0def4",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              tabSize: 2,
            }}
          >
            {displayedCode}
            {cursorVisible && (
              <span style={{ background: "#e0def4", color: "#1e1e2e" }}>
                {" "}
              </span>
            )}
          </pre>
        </div>
      </div>
    </SceneContainer>
  );
};

// ---------------------------------------------------------------------------
// Scene Router
// ---------------------------------------------------------------------------

const SceneRouter: React.FC<{ scene: SceneData }> = ({ scene }) => {
  switch (scene.type) {
    case "title":
      return <TitleSlide scene={scene} />;
    case "text":
      return <TextSlide scene={scene} />;
    case "bullets":
      return <BulletsSlide scene={scene} />;
    case "table":
      return <TableSlide scene={scene} />;
    case "chart-bar":
      return <ChartBarSlide scene={scene} />;
    case "stats":
      return <StatsSlide scene={scene} />;
    case "comparison":
      return <ComparisonSlide scene={scene} />;
    case "quote":
      return <QuoteSlide scene={scene} />;
    case "code":
      return <CodeSlide scene={scene} />;
    default:
      return null;
  }
};

// ---------------------------------------------------------------------------
// Main Composition
// ---------------------------------------------------------------------------

export const SceneVideo: React.FC<SceneVideoProps> = ({ scenes }) => {
  if (!scenes || scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          background: "#0f0c29",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT_FAMILY,
        }}
      >
        <p style={{ color: "white", fontSize: 36 }}>No scenes</p>
      </AbsoluteFill>
    );
  }

  const elements: React.ReactNode[] = [];

  scenes.forEach((scene, i) => {
    if (i > 0) {
      elements.push(
        <TransitionSeries.Transition
          key={`t-${i}`}
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />,
      );
    }
    elements.push(
      <TransitionSeries.Sequence
        key={`s-${i}`}
        durationInFrames={scene.durationInFrames}
      >
        <SceneRouter scene={scene} />
      </TransitionSeries.Sequence>,
    );
  });

  return (
    <AbsoluteFill>
      <TransitionSeries>{elements}</TransitionSeries>
    </AbsoluteFill>
  );
};
