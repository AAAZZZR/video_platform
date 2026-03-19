import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a Remotion video component generator. You generate self-contained React components that create stunning animated video content.

## Output Format
Return ONLY the React component code. No markdown fences, no explanations, no commentary. Just raw TypeScript/JSX code.

## Component Requirements
1. Export a default React functional component
2. The component receives NO props - all content is embedded in the code
3. Use ONLY these imports (nothing else is available):
   - import React from 'react';
   - import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Sequence, Series, Img, Audio } from 'remotion';
4. The composition is 1920x1080 at 30fps

## Animation Rules (CRITICAL - violating these will break rendering)
- ALL animations MUST be driven by useCurrentFrame() combined with interpolate() or spring()
- CSS transitions are FORBIDDEN (transition, animation, @keyframes)
- Tailwind animation classes are FORBIDDEN
- requestAnimationFrame is FORBIDDEN
- setTimeout/setInterval is FORBIDDEN
- Use interpolate() for linear animations:
  interpolate(frame, [startFrame, endFrame], [startValue, endValue], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
- Use spring() for natural motion:
  spring({ frame, fps, config: { damping: 200 } }) // smooth
  spring({ frame, fps, config: { damping: 20, stiffness: 200 } }) // snappy
  spring({ frame, fps, delay: i * 5, config: { damping: 200 } }) // staggered
- Write timing in seconds and multiply by fps: const fadeStart = 1 * fps; // 1 second

## Styling Rules
- ALL styling must be inline: style={{ ... }}
- Use AbsoluteFill as the root container
- No CSS modules, no className (except basic layout), no external stylesheets
- Common font: fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
- Monospace: fontFamily: '"SF Mono", "Fira Code", Consolas, monospace'

## Sequencing
- Use <Sequence from={startFrame} durationInFrames={duration}> to show elements at specific times
- Use <Series> for back-to-back sections
- Inside a Sequence, useCurrentFrame() returns LOCAL frame (starting from 0)

## SVG Animations
For custom graphics (stick figures, icons, diagrams):
- Use inline <svg> elements
- Animate SVG properties via interpolate/spring (transform, opacity, d attribute, etc.)
- For stick figures: use <line>, <circle> for body parts, animate joint rotations with transform
- For charts: animate rect height/width, circle stroke-dashoffset
- Always set viewBox on <svg>

## Content Guidelines
- Make it visually impressive and engaging
- Use smooth animations and good timing
- Include scene transitions (fade between sections)
- Use a dark background (e.g., #0a0a0a, #0f0c29) with white/colored text
- For multi-section content, organize with Sequence/Series
- Calculate total duration based on content length: aim for ~4-6 seconds per section
- Return the total duration as a comment at the top: // DURATION: 300 (in frames)
- Return narration text as a comment block at the top (for TTS voiceover):
  // NARRATION: Your narration text here. This is what will be spoken as voiceover.
  The narration should be natural spoken language that complements the visuals. Write concise narration that fits the video duration (~2-3 words per second). If the content has multiple sections, combine all narration into one continuous paragraph.

## Example Structure
// DURATION: 450
// NARRATION: Welcome to our animated presentation. Here we explore the key concepts with engaging visuals and smooth transitions.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

export default function MyVideo() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <Sequence from={0} durationInFrames={120}>
        {/* Scene 1 */}
      </Sequence>
      <Sequence from={120} durationInFrames={120}>
        {/* Scene 2 */}
      </Sequence>
    </AbsoluteFill>
  );
}

## Stick Figure Animation Guide
For animated characters, use SVG with rotating limbs:
- Body: <line x1={0} y1={-20} x2={0} y2={20} />
- Head: <circle cx={0} cy={-28} r={8} />
- Arms/legs: <line> with transform={\`rotate(\${angle})\`} and transformOrigin at joint
- Running cycle: alternate leg/arm angles using sin(frame * speed) or interpolate with looping
- Loop animation: const cycle = (frame % cycleLength) to create repeating motion
- Moving across screen: interpolate(frame, [0, totalFrames], [-200, width + 200]) for horizontal movement`;

function extractCode(text: string): string {
  // Try to find code within markdown fences
  const fenceMatch = text.match(/```(?:tsx?|jsx?|react)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // If no fences found, assume the entire response is code
  return text.trim();
}

function extractDuration(code: string): number {
  const durationMatch = code.match(/\/\/\s*DURATION:\s*(\d+)/);
  if (durationMatch) {
    const parsed = parseInt(durationMatch[1], 10);
    if (parsed > 0 && parsed <= 9000) {
      return parsed;
    }
  }
  return 300;
}

function extractNarration(code: string): string {
  const match = code.match(/\/\/\s*NARRATION:\s*(.+)/);
  return match ? match[1].trim() : "";
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: { topic?: string; model?: string; language?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 },
    );
  }

  const { topic, model, language } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return NextResponse.json(
      { error: "A non-empty 'topic' field is required." },
      { status: 400 },
    );
  }

  let systemPrompt = SYSTEM_PROMPT;
  if (language) {
    systemPrompt += `\n\n## Language\nGenerate all text content (titles, labels, descriptions, narration) in ${language}. Keep code syntax, variable names, and imports in English.`;
  }

  let userMessage = `Create an animated Remotion video component about: ${topic.trim()}`;
  if (language) {
    userMessage += `\n\nAll visible text content must be in ${language}.`;
  }

  const modelId =
    model && typeof model === "string" ? model : "claude-sonnet-4-20250514";
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: modelId,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response received from AI." },
        { status: 500 },
      );
    }

    const code = extractCode(textBlock.text);

    if (!code || code.length < 50) {
      return NextResponse.json(
        { error: "AI returned insufficient code. Please try again." },
        { status: 500 },
      );
    }

    const durationInFrames = extractDuration(code);
    const narration = extractNarration(code);

    return NextResponse.json({ code, durationInFrames, narration });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error calling AI service.";
    console.error("Generate creative error:", message);
    return NextResponse.json(
      { error: `AI generation failed: ${message}` },
      { status: 500 },
    );
  }
}
