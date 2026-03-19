"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import UserMenu from "@/app/components/UserMenu";
import {
  BACKGROUND_PRESETS,
  FPS,
  VOICE_PRESETS,
  MODEL_OPTIONS,
  type SceneData,
  type SceneType,
} from "@/src/types";

const PlayerPreview = dynamic(
  () => import("@/app/components/PlayerPreview"),
  { ssr: false },
);

const DynamicRenderer = dynamic(
  () => import("@/app/components/DynamicRenderer"),
  { ssr: false },
);

// ---- Scene Type Config ----

const SCENE_TYPE_OPTIONS: { value: SceneType; label: string; color: string }[] =
  [
    { value: "title", label: "Title", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    { value: "text", label: "Text", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    { value: "bullets", label: "Bullets", color: "bg-green-500/20 text-green-300 border-green-500/30" },
    { value: "table", label: "Table", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { value: "chart-bar", label: "Chart", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
    { value: "stats", label: "Stats", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
    { value: "comparison", label: "Compare", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    { value: "quote", label: "Quote", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    { value: "code", label: "Code", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  ];

function getSceneTypeMeta(type: SceneType) {
  return SCENE_TYPE_OPTIONS.find((o) => o.value === type) ?? SCENE_TYPE_OPTIONS[1];
}

function createDefaultScene(type: SceneType, index: number): SceneData {
  const base = {
    title: "New Scene",
    background: BACKGROUND_PRESETS[index % BACKGROUND_PRESETS.length],
    durationInFrames: 4 * FPS,
  };

  switch (type) {
    case "title":
      return { ...base, type: "title", subtitle: "Subtitle goes here" };
    case "text":
      return { ...base, type: "text", body: "Enter your text here" };
    case "bullets":
      return { ...base, type: "bullets", items: ["Point one", "Point two", "Point three"] };
    case "table":
      return { ...base, type: "table", headers: ["Column A", "Column B"], rows: [["Cell 1", "Cell 2"]] };
    case "chart-bar":
      return { ...base, type: "chart-bar", items: [{ label: "Item A", value: 75 }, { label: "Item B", value: 50 }] };
    case "stats":
      return { ...base, type: "stats", items: [{ value: "95%", label: "Satisfaction" }] };
    case "comparison":
      return { ...base, type: "comparison", leftTitle: "Before", rightTitle: "After", leftItems: ["Old way"], rightItems: ["New way"] };
    case "quote":
      return { ...base, type: "quote", quote: "Your quote here", author: "Author" };
    case "code":
      return { ...base, type: "code", code: 'console.log("Hello");', language: "javascript" };
  }
}

// ---- Tab Icons ----

function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CreativeIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function QuickIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

// ---- Spinner ----

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ---- Voice Selector ----

function VoiceSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
    >
      <optgroup label="English">
        {VOICE_PRESETS.filter((v) => v.language === "en").map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </optgroup>
      <optgroup label="中文 (简体)">
        {VOICE_PRESETS.filter((v) => v.language === "zh-CN").map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </optgroup>
      <optgroup label="中文 (繁體)">
        {VOICE_PRESETS.filter((v) => v.language === "zh-TW").map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </optgroup>
    </select>
  );
}

// ---- Helpers ----

function getLanguageFromVoice(voiceId: string): string {
  if (voiceId.startsWith("zh-TW")) return "Traditional Chinese (繁體中文)";
  if (voiceId.startsWith("zh-CN")) return "Simplified Chinese (简体中文)";
  return "English";
}

// ---- Types ----

type RenderState = "idle" | "rendering" | "done" | "error";
type Mode = "template" | "creative" | "quick";

// ============================================================
// Main Component
// ============================================================

export default function Home() {
  // ---- Mode ----
  const [mode, setMode] = useState<Mode>("template");

  // ---- Shared State ----
  const [topic, setTopic] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-20250514");
  const [selectedVoice, setSelectedVoice] = useState("zh-TW-HsiaoChenNeural");
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState("");
  const [expandedScene, setExpandedScene] = useState<number | null>(null);

  // ---- Render State ----
  const [renderState, setRenderState] = useState<RenderState>("idle");
  const [renderId, setRenderId] = useState<string | null>(null);
  const [bucketName, setBucketName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---- Creative Mode State ----
  const [creativeCode, setCreativeCode] = useState("");
  const [creativeDuration, setCreativeDuration] = useState(300);
  const [creativeAudioUrl, setCreativeAudioUrl] = useState<string | null>(null);
  const [generatingCreative, setGeneratingCreative] = useState(false);

  // ---- Quick Mode State ----
  const [quickContent, setQuickContent] = useState("");

  // ============================================================
  // Template Mode: Merged Generate (Script + Audio)
  // ============================================================

  const generateVideo = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGenerateError(null);
    setProgressText("Generating script...");
    try {
      // Step 1: Generate script
      const scriptRes = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, model: selectedModel, language: getLanguageFromVoice(selectedVoice) }),
      });
      const scriptData = await scriptRes.json();
      if (!scriptRes.ok) {
        throw new Error(scriptData.error || "Failed to generate script");
      }
      if (scriptData.scenes) {
        setScenes(scriptData.scenes);
        setExpandedScene(null);
      }

      // Step 2: Generate audio
      setProgressText("Generating audio...");
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes: scriptData.scenes, voiceId: selectedVoice }),
      });
      const ttsData = await ttsRes.json();
      if (!ttsRes.ok) throw new Error(ttsData.error || "TTS failed");
      if (ttsData.scenes) setScenes(ttsData.scenes);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
      setProgressText("");
    }
  };

  // ============================================================
  // Creative Mode: Generate Animation
  // ============================================================

  const generateCreative = async () => {
    if (!topic.trim()) return;
    setGeneratingCreative(true);
    setGenerateError(null);
    setCreativeAudioUrl(null);
    setProgressText("Generating animation...");
    try {
      // Step 1: Generate animation code + narration
      const res = await fetch("/api/generate-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, model: selectedModel, language: getLanguageFromVoice(selectedVoice) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setCreativeCode(data.code);
      setCreativeDuration(data.durationInFrames || 300);

      // Step 2: Generate TTS audio from narration
      if (data.narration) {
        setProgressText("Generating audio...");
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenes: [{ narration: data.narration }],
            voiceId: selectedVoice,
          }),
        });
        const ttsData = await ttsRes.json();
        if (ttsData.scenes?.[0]?.audioUrl) {
          setCreativeAudioUrl(ttsData.scenes[0].audioUrl);
        }
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Creative generation failed");
    } finally {
      setGeneratingCreative(false);
      setProgressText("");
    }
  };

  // ============================================================
  // Quick Mode: Paste Content -> Video
  // ============================================================

  const generateQuick = async () => {
    if (!quickContent.trim()) return;
    setGenerating(true);
    setGenerateError(null);
    setProgressText("Generating script...");
    try {
      const quickTopic = `Create an engaging video presentation summarizing the following content. Extract key points and organize into clear scenes:\n\n${quickContent}`;

      // Step 1: Generate script
      const scriptRes = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: quickTopic, model: selectedModel, language: getLanguageFromVoice(selectedVoice) }),
      });
      const scriptData = await scriptRes.json();
      if (!scriptRes.ok) throw new Error(scriptData.error || "Failed to generate script");

      // Step 2: Generate audio
      setProgressText("Generating audio...");
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes: scriptData.scenes, voiceId: selectedVoice }),
      });
      const ttsData = await ttsRes.json();
      if (!ttsRes.ok) throw new Error(ttsData.error || "TTS failed");

      setScenes(ttsData.scenes || scriptData.scenes);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
      setProgressText("");
    }
  };

  // ============================================================
  // Scene CRUD
  // ============================================================

  const updateScene = (index: number, updater: (scene: SceneData) => SceneData) => {
    setScenes((prev) => prev.map((s, i) => (i === index ? updater(s) : s)));
  };

  const updateSceneField = (index: number, field: string, value: unknown) => {
    setScenes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const changeSceneType = (index: number, newType: SceneType) => {
    setScenes((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const newScene = createDefaultScene(newType, i);
        return { ...newScene, title: s.title, background: s.background, durationInFrames: s.durationInFrames };
      }),
    );
  };

  const addScene = () => {
    setScenes((prev) => [...prev, createDefaultScene("text", prev.length)]);
  };

  const removeScene = (index: number) => {
    setScenes((prev) => prev.filter((_, i) => i !== index));
    if (expandedScene === index) setExpandedScene(null);
    else if (expandedScene !== null && expandedScene > index) setExpandedScene(expandedScene - 1);
  };

  // ============================================================
  // Render
  // ============================================================

  const startRender = async () => {
    setRenderState("rendering");
    setProgress(0);
    setOutputUrl(null);
    setError(null);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start render");
      }

      const data = await res.json();
      setRenderId(data.renderId);
      setBucketName(data.bucketName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
      setRenderState("error");
    }
  };

  const pollProgress = useCallback(async () => {
    if (!renderId || !bucketName) return;

    try {
      const res = await fetch(
        `/api/render-progress?renderId=${renderId}&bucketName=${bucketName}`,
      );
      const data = await res.json();

      if (data.fatalErrorEncountered) {
        setError("Render failed on Lambda");
        setRenderState("error");
        return;
      }

      setProgress(data.progress ?? 0);

      if (data.done) {
        setOutputUrl(data.outputUrl);
        setRenderState("done");
      }
    } catch {
      setError("Failed to check progress");
      setRenderState("error");
    }
  }, [renderId, bucketName]);

  useEffect(() => {
    if (renderState !== "rendering" || !renderId) return;
    const interval = setInterval(pollProgress, 1500);
    return () => clearInterval(interval);
  }, [renderState, renderId, pollProgress]);

  // ============================================================
  // Scene Detail Editors
  // ============================================================

  const renderSceneFields = (scene: SceneData, index: number) => {
    switch (scene.type) {
      case "title":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Subtitle</label>
            <input
              type="text"
              value={scene.subtitle}
              onChange={(e) => updateSceneField(index, "subtitle", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        );

      case "text":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Body</label>
            <textarea
              value={scene.body}
              onChange={(e) => updateSceneField(index, "body", e.target.value)}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
        );

      case "bullets":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Bullet Points</label>
            <div className="space-y-2">
              {scene.items.map((item, bi) => (
                <div key={bi} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...scene.items];
                      newItems[bi] = e.target.value;
                      updateSceneField(index, "items", newItems);
                    }}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={() => {
                      const newItems = scene.items.filter((_, j) => j !== bi);
                      updateSceneField(index, "items", newItems);
                    }}
                    className="text-zinc-600 hover:text-red-400 transition-colors px-2 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateSceneField(index, "items", [...scene.items, "New item"])}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                + Add item
              </button>
            </div>
          </div>
        );

      case "table":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Table</label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {scene.headers.map((h, hi) => (
                      <th key={hi} className="p-1">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const newHeaders = [...scene.headers];
                            newHeaders[hi] = e.target.value;
                            updateSceneField(index, "headers", newHeaders);
                          }}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </th>
                    ))}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {scene.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="p-1">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const newRows = scene.rows.map((r) => [...r]);
                              newRows[ri][ci] = e.target.value;
                              updateSceneField(index, "rows", newRows);
                            }}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                          />
                        </td>
                      ))}
                      <td className="p-1">
                        <button
                          onClick={() => {
                            const newRows = scene.rows.filter((_, j) => j !== ri);
                            updateSceneField(index, "rows", newRows);
                          }}
                          className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  const newRow = scene.headers.map(() => "");
                  updateSceneField(index, "rows", [...scene.rows, newRow]);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                + Add row
              </button>
              <button
                onClick={() => {
                  const newHeaders = [...scene.headers, `Col ${scene.headers.length + 1}`];
                  const newRows = scene.rows.map((r) => [...r, ""]);
                  updateScene(index, (s) => ({ ...s, headers: newHeaders, rows: newRows } as SceneData));
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                + Add column
              </button>
            </div>
          </div>
        );

      case "chart-bar":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Chart Items</label>
            <div className="space-y-2">
              {scene.items.map((item, bi) => (
                <div key={bi} className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    placeholder="Label"
                    onChange={(e) => {
                      const newItems = [...scene.items];
                      newItems[bi] = { ...newItems[bi], label: e.target.value };
                      updateSceneField(index, "items", newItems);
                    }}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => {
                      const newItems = [...scene.items];
                      newItems[bi] = { ...newItems[bi], value: parseFloat(e.target.value) || 0 };
                      updateSceneField(index, "items", newItems);
                    }}
                    className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={() => updateSceneField(index, "items", scene.items.filter((_, j) => j !== bi))}
                    className="text-zinc-600 hover:text-red-400 transition-colors px-2 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateSceneField(index, "items", [...scene.items, { label: "New", value: 50 }])}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                + Add item
              </button>
            </div>
          </div>
        );

      case "stats":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Stats</label>
            <div className="space-y-2">
              {scene.items.map((item, bi) => (
                <div key={bi} className="flex gap-2">
                  <input
                    type="text"
                    value={item.value}
                    placeholder="Value (e.g. 95%)"
                    onChange={(e) => {
                      const newItems = [...scene.items];
                      newItems[bi] = { ...newItems[bi], value: e.target.value };
                      updateSceneField(index, "items", newItems);
                    }}
                    className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="text"
                    value={item.label}
                    placeholder="Label"
                    onChange={(e) => {
                      const newItems = [...scene.items];
                      newItems[bi] = { ...newItems[bi], label: e.target.value };
                      updateSceneField(index, "items", newItems);
                    }}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={() => updateSceneField(index, "items", scene.items.filter((_, j) => j !== bi))}
                    className="text-zinc-600 hover:text-red-400 transition-colors px-2 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateSceneField(index, "items", [...scene.items, { value: "0", label: "New stat" }])}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                + Add stat
              </button>
            </div>
          </div>
        );

      case "comparison":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Left Title</label>
                <input
                  type="text"
                  value={scene.leftTitle}
                  onChange={(e) => updateSceneField(index, "leftTitle", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Right Title</label>
                <input
                  type="text"
                  value={scene.rightTitle}
                  onChange={(e) => updateSceneField(index, "rightTitle", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Left Items</label>
                <div className="space-y-2">
                  {scene.leftItems.map((item, bi) => (
                    <div key={bi} className="flex gap-1">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...scene.leftItems];
                          newItems[bi] = e.target.value;
                          updateSceneField(index, "leftItems", newItems);
                        }}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => updateSceneField(index, "leftItems", scene.leftItems.filter((_, j) => j !== bi))}
                        className="text-zinc-600 hover:text-red-400 cursor-pointer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateSceneField(index, "leftItems", [...scene.leftItems, "New item"])}
                    className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Right Items</label>
                <div className="space-y-2">
                  {scene.rightItems.map((item, bi) => (
                    <div key={bi} className="flex gap-1">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...scene.rightItems];
                          newItems[bi] = e.target.value;
                          updateSceneField(index, "rightItems", newItems);
                        }}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => updateSceneField(index, "rightItems", scene.rightItems.filter((_, j) => j !== bi))}
                        className="text-zinc-600 hover:text-red-400 cursor-pointer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateSceneField(index, "rightItems", [...scene.rightItems, "New item"])}
                    className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "quote":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Quote</label>
              <textarea
                value={scene.quote}
                onChange={(e) => updateSceneField(index, "quote", e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Author</label>
              <input
                type="text"
                value={scene.author}
                onChange={(e) => updateSceneField(index, "author", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        );

      case "code":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Code</label>
              <textarea
                value={scene.code}
                onChange={(e) => updateSceneField(index, "code", e.target.value)}
                rows={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Language</label>
              <input
                type="text"
                value={scene.language}
                onChange={(e) => updateSceneField(index, "language", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="javascript, python, etc."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================================
  // Shared: Preview + Scenes Editor + Render Section
  // ============================================================

  const renderPreviewAndEditor = () => (
    <>
      {/* Preview */}
      {scenes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Preview</h2>
          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black">
            <PlayerPreview scenes={scenes} />
          </div>
        </section>
      )}

      {/* Empty state */}
      {scenes.length === 0 && !generating && (
        <section className="border border-dashed border-zinc-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>
          <p className="text-zinc-500 text-sm mb-1">No scenes yet</p>
          <p className="text-zinc-600 text-xs">
            {mode === "template"
              ? "Enter a topic above and click Generate Video to get started"
              : "Paste your content above and click Create Video to get started"}
          </p>
        </section>
      )}

      {/* Scenes Editor */}
      {scenes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Scenes ({scenes.length})
            </h2>
            <button
              onClick={addScene}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              Add Scene
            </button>
          </div>

          <div className="space-y-3">
            {scenes.map((scene, index) => {
              const typeMeta = getSceneTypeMeta(scene.type);
              const isExpanded = expandedScene === index;

              return (
                <div
                  key={index}
                  className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden"
                >
                  {/* Collapsed header */}
                  <div
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                    onClick={() => setExpandedScene(isExpanded ? null : index)}
                  >
                    <span className="text-xs font-mono text-zinc-600 w-6 shrink-0">
                      {index + 1}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeMeta.color}`}>
                      {typeMeta.label}
                    </span>
                    <span className="text-sm text-zinc-300 truncate flex-1">
                      {scene.title}
                    </span>
                    <span className="text-xs text-zinc-600 shrink-0">
                      {(scene.durationInFrames / FPS).toFixed(1)}s
                    </span>
                    {scene.audioUrl && (
                      <span className="text-xs text-green-500 shrink-0" title="Audio generated">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" />
                          <path d="M15.54 8.46a5 5 0 010 7.08" />
                        </svg>
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeScene(index); }}
                      className="text-zinc-700 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`text-zinc-600 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800 px-5 py-5 space-y-4">
                      {/* Scene type + title row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1.5">Scene Type</label>
                          <select
                            value={scene.type}
                            onChange={(e) => changeSceneType(index, e.target.value as SceneType)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                          >
                            {SCENE_TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1.5">Title</label>
                          <input
                            type="text"
                            value={scene.title}
                            onChange={(e) => updateSceneField(index, "title", e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1.5">Duration (seconds)</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            step={0.5}
                            value={scene.durationInFrames / FPS}
                            onChange={(e) =>
                              updateSceneField(index, "durationInFrames", Math.round(parseFloat(e.target.value) * FPS) || FPS)
                            }
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Type-specific fields */}
                      {renderSceneFields(scene, index)}

                      {/* Background picker */}
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1.5">Background</label>
                        <div className="flex gap-2 flex-wrap">
                          {BACKGROUND_PRESETS.map((preset, pi) => (
                            <button
                              key={pi}
                              onClick={() => updateSceneField(index, "background", preset)}
                              className="w-8 h-8 rounded-lg cursor-pointer transition-transform hover:scale-110"
                              style={{
                                background: preset,
                                outline: scene.background === preset ? "2px solid #3b82f6" : "2px solid transparent",
                                outlineOffset: 2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Render Section */}
      {scenes.length > 0 && (
        <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-5">Render</h2>

          {renderState === "idle" && (
            <button
              onClick={startRender}
              disabled={scenes.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              Render Video on Cloud
            </button>
          )}

          {renderState === "rendering" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Rendering...</span>
                <span className="text-sm font-mono text-zinc-400">{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600 mt-2">Rendering on AWS Lambda -- this usually takes 10-30 seconds</p>
            </div>
          )}

          {renderState === "done" && outputUrl && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-green-400 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="font-medium">Render complete!</span>
              </div>
              <div className="flex gap-3 justify-center">
                <a
                  href={outputUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors inline-block"
                >
                  Download Video
                </a>
                <button
                  onClick={() => {
                    setRenderState("idle");
                    setRenderId(null);
                    setBucketName(null);
                    setProgress(0);
                    setOutputUrl(null);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors cursor-pointer"
                >
                  Render Again
                </button>
              </div>
            </div>
          )}

          {renderState === "error" && (
            <div>
              <div className="bg-red-950/50 border border-red-900 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={() => { setRenderState("idle"); setError(null); }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );

  // ============================================================
  // Tab Definitions
  // ============================================================

  const tabs: { id: Mode; label: string; zhLabel: string; icon: React.ReactNode }[] = [
    { id: "template", label: "Template", zhLabel: "模板", icon: <TemplateIcon /> },
    { id: "creative", label: "Creative", zhLabel: "創意動畫", icon: <CreativeIcon /> },
    { id: "quick", label: "Quick", zhLabel: "快速", icon: <QuickIcon /> },
  ];

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">VidCraft AI</span>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="sticky top-[65px] z-40 bg-[#09090b]/90 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
                  mode === tab.id
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="text-xs opacity-60">({tab.zhLabel})</span>
                {/* Active indicator */}
                {mode === tab.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8 flex-1">
        {/* ============================================================ */}
        {/* MODE: TEMPLATE                                               */}
        {/* ============================================================ */}
        {mode === "template" && (
          <>
            {/* Step 1: Generate */}
            <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
                Generate Video
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Topic or Description</label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe the video you want to create... e.g. 'A 5-slide presentation about the benefits of remote work'"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">AI Model</label>
                  <div className="flex gap-2">
                    {MODEL_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModel(m.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                          selectedModel === m.id
                            ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        {m.name}
                        <span className="ml-1.5 text-xs opacity-60">{m.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Voice</label>
                  <VoiceSelector value={selectedVoice} onChange={setSelectedVoice} />
                </div>
                {generateError && (
                  <div className="bg-red-950/50 border border-red-900 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{generateError}</p>
                  </div>
                )}
                <button
                  onClick={generateVideo}
                  disabled={generating || !topic.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <Spinner />
                      {progressText || "Generating..."}
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Generate Video
                    </>
                  )}
                </button>
              </div>
            </section>

            {renderPreviewAndEditor()}
          </>
        )}

        {/* ============================================================ */}
        {/* MODE: CREATIVE                                               */}
        {/* ============================================================ */}
        {mode === "creative" && (
          <>
            {/* Input */}
            <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreativeIcon className="text-zinc-400" />
                Creative Animation
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Topic / Description</label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe the animation you want... e.g. 'A colorful particle system that forms into the text Hello World'"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">AI Model</label>
                  <div className="flex gap-2">
                    {MODEL_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModel(m.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                          selectedModel === m.id
                            ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        {m.name}
                        <span className="ml-1.5 text-xs opacity-60">{m.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <VoiceSelector value={selectedVoice} onChange={setSelectedVoice} />
                {generateError && (
                  <div className="bg-red-950/50 border border-red-900 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{generateError}</p>
                  </div>
                )}
                <button
                  onClick={generateCreative}
                  disabled={generatingCreative || !topic.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {generatingCreative ? (
                    <>
                      <Spinner />
                      {progressText || "Generating..."}
                    </>
                  ) : (
                    <>
                      <CreativeIcon />
                      Generate Animation
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Preview */}
            {creativeCode && (
              <section>
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Preview</h2>
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black">
                  <DynamicRenderer
                    code={creativeCode}
                    durationInFrames={creativeDuration}
                    audioUrl={creativeAudioUrl ?? undefined}
                  />
                </div>
              </section>
            )}

            {/* Generated Code */}
            {creativeCode && (
              <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-5">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Generated Code</h2>
                <pre className="bg-[#1e1e2e] rounded-lg p-4 overflow-x-auto text-sm text-[#e0def4] font-mono leading-relaxed max-h-96 overflow-y-auto">
                  {creativeCode}
                </pre>
              </section>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* MODE: QUICK                                                  */}
        {/* ============================================================ */}
        {mode === "quick" && (
          <>
            {/* Paste Content */}
            <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <QuickIcon className="text-zinc-400" />
                Quick Video
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Paste your article or content</label>
                  <textarea
                    value={quickContent}
                    onChange={(e) => setQuickContent(e.target.value)}
                    placeholder="Paste an article, blog post, notes, or any text content here. We'll automatically turn it into a video presentation..."
                    rows={8}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Voice</label>
                  <VoiceSelector value={selectedVoice} onChange={setSelectedVoice} />
                </div>
                {generateError && (
                  <div className="bg-red-950/50 border border-red-900 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{generateError}</p>
                  </div>
                )}
                <button
                  onClick={generateQuick}
                  disabled={generating || !quickContent.trim()}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <Spinner />
                      {progressText || "Creating video..."}
                    </>
                  ) : (
                    <>
                      <QuickIcon />
                      Create Video
                    </>
                  )}
                </button>
              </div>
            </section>

            {renderPreviewAndEditor()}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-zinc-600 text-xs mt-auto pb-10 pt-16">
        VidCraft AI -- Powered by Remotion + AWS Lambda
      </footer>
    </div>
  );
}
