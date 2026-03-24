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
import { useI18n } from "@/lib/i18n";
import LanguageSelector from "@/app/components/LanguageSelector";

const PlayerPreview = dynamic(
  () => import("@/app/components/PlayerPreview"),
  { ssr: false },
);

const DynamicRenderer = dynamic(
  () => import("@/app/components/DynamicRenderer"),
  { ssr: false },
);

const ScenePreview = dynamic(
  () => import("@/app/components/ScenePreview"),
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

const DURATION_OPTIONS = [
  { value: 30, label: "30s", description: "Short" },
  { value: 60, label: "60s", description: "Standard" },
  { value: 90, label: "90s", description: "Extended" },
  { value: 120, label: "2 min", description: "Long" },
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

const VOICE_GROUPS = [
  { lang: "en", label: "English" },
  { lang: "zh-CN", label: "中文 (简体)" },
  { lang: "zh-TW", label: "中文 (繁體)" },
  { lang: "ja", label: "日本語" },
  { lang: "ko", label: "한국어" },
  { lang: "ar", label: "العربية" },
  { lang: "es", label: "Español" },
  { lang: "fr", label: "Français" },
] as const;

function VoiceSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
    >
      {VOICE_GROUPS.map((g) => {
        const voices = VOICE_PRESETS.filter((v) => v.language === g.lang);
        if (voices.length === 0) return null;
        return (
          <optgroup key={g.lang} label={g.label}>
            {voices.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

// ---- Helpers ----

function getLanguageFromVoice(voiceId: string): string {
  if (voiceId.startsWith("zh-TW")) return "Traditional Chinese (繁體中文)";
  if (voiceId.startsWith("zh-CN")) return "Simplified Chinese (简体中文)";
  if (voiceId.startsWith("ja-")) return "Japanese (日本語)";
  if (voiceId.startsWith("ko-")) return "Korean (한국어)";
  if (voiceId.startsWith("ar-")) return "Arabic (العربية)";
  if (voiceId.startsWith("es-")) return "Spanish (Español)";
  if (voiceId.startsWith("fr-")) return "French (Français)";
  return "English";
}

// ---- Duration description i18n key map ----

const DURATION_DESC_KEYS: Record<string, string> = {
  Short: "create.short",
  Standard: "create.standard",
  Extended: "create.extended",
  Long: "create.long",
};

// ---- Types ----

type RenderState = "idle" | "rendering" | "done" | "error";
type Mode = "template" | "creative";

// ============================================================
// Main Component
// ============================================================

export default function Home() {
  const { t } = useI18n();

  // ---- Mode ----
  const [mode, setMode] = useState<Mode>("template");

  // ---- Shared State ----
  const [topic, setTopic] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-20250514");
  const [selectedVoice, setSelectedVoice] = useState("zh-TW-HsiaoChenNeural");
  const [targetDuration, setTargetDuration] = useState(60);
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
  const [creativeCaptions, setCreativeCaptions] = useState<import("@/src/types").CaptionWord[]>([]);
  const [generatingCreative, setGeneratingCreative] = useState(false);
  const [copied, setCopied] = useState(false);

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
        body: JSON.stringify({ topic, model: selectedModel, language: getLanguageFromVoice(selectedVoice), targetDuration }),
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
        body: JSON.stringify({ topic, model: selectedModel, language: getLanguageFromVoice(selectedVoice), targetDuration }),
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
            scenes: [{ narration: data.narration, durationInFrames: data.durationInFrames || 300 }],
            voiceId: selectedVoice,
          }),
        });
        const ttsData = await ttsRes.json();
        if (ttsData.scenes?.[0]) {
          if (ttsData.scenes[0].audioUrl) setCreativeAudioUrl(ttsData.scenes[0].audioUrl);
          if (ttsData.scenes[0].captions) setCreativeCaptions(ttsData.scenes[0].captions);
        }
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Creative generation failed");
    } finally {
      setGeneratingCreative(false);
      setProgressText("");
    }
  };

  const startCreativeRender = async () => {
    setRenderState("rendering");
    setProgress(0);
    setOutputUrl(null);
    setError(null);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creative: true,
          code: creativeCode,
          durationInFrames: creativeDuration,
          audioUrl: creativeAudioUrl,
        }),
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

  const handleExportPptx = async () => {
    try {
      const { exportToPptx } = await import("@/lib/export-pptx");
      await exportToPptx(scenes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PPT export failed");
    }
  };

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
        setError(data.errorMessage || "Render failed on Lambda");
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
            <label className="block text-xs text-zinc-500 mb-1.5">{t("create.subtitle")}</label>
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
            <label className="block text-xs text-zinc-500 mb-1.5">{t("create.body")}</label>
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
            <label className="block text-xs text-zinc-500 mb-1.5">{t("create.bulletPoints")}</label>
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
                {t("create.addItem")}
              </button>
            </div>
          </div>
        );

      case "table":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">{t("create.table")}</label>
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
                {t("create.addRow")}
              </button>
              <button
                onClick={() => {
                  const newHeaders = [...scene.headers, `Col ${scene.headers.length + 1}`];
                  const newRows = scene.rows.map((r) => [...r, ""]);
                  updateScene(index, (s) => ({ ...s, headers: newHeaders, rows: newRows } as SceneData));
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                {t("create.addColumn")}
              </button>
            </div>
          </div>
        );

      case "chart-bar":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">{t("create.chartItems")}</label>
            <div className="space-y-2">
              {scene.items.map((item, bi) => (
                <div key={bi} className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    placeholder={t("create.label")}
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
                {t("create.addItem")}
              </button>
            </div>
          </div>
        );

      case "stats":
        return (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">{t("create.stats")}</label>
            <div className="space-y-2">
              {scene.items.map((item, bi) => (
                <div key={bi} className="flex gap-2">
                  <input
                    type="text"
                    value={item.value}
                    placeholder={t("create.valuePlaceholder")}
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
                    placeholder={t("create.label")}
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
                {t("create.addStat")}
              </button>
            </div>
          </div>
        );

      case "comparison":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">{t("create.leftTitle")}</label>
                <input
                  type="text"
                  value={scene.leftTitle}
                  onChange={(e) => updateSceneField(index, "leftTitle", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">{t("create.rightTitle")}</label>
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
                <label className="block text-xs text-zinc-500 mb-1.5">{t("create.leftItems")}</label>
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
                    {t("create.add")}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">{t("create.rightItems")}</label>
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
                    {t("create.add")}
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
              <label className="block text-xs text-zinc-500 mb-1.5">{t("create.quote")}</label>
              <textarea
                value={scene.quote}
                onChange={(e) => updateSceneField(index, "quote", e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">{t("create.author")}</label>
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
              <label className="block text-xs text-zinc-500 mb-1.5">{t("create.code")}</label>
              <textarea
                value={scene.code}
                onChange={(e) => updateSceneField(index, "code", e.target.value)}
                rows={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">{t("create.language")}</label>
              <input
                type="text"
                value={scene.language}
                onChange={(e) => updateSceneField(index, "language", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder={t("create.languagePlaceholder")}
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
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">{t("common.preview")}</h2>
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
          <p className="text-zinc-500 text-sm mb-1">{t("create.noScenes")}</p>
          <p className="text-zinc-600 text-xs">
            {mode === "template"
              ? t("create.noScenesTemplate")
              : t("create.noScenesCreative")}
          </p>
        </section>
      )}

      {/* Scenes Editor */}
      {scenes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              {t("create.scenes")} ({scenes.length})
            </h2>
            <button
              onClick={addScene}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              {t("create.addScene")}
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
                    <div className="border-t border-zinc-800 px-5 py-5">
                      <div className="flex flex-col lg:flex-row gap-5">
                        {/* Left: Editor controls */}
                        <div className="flex-1 min-w-0 space-y-4">
                          {/* Scene type + title row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-zinc-500 mb-1.5">{t("create.sceneType")}</label>
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
                              <label className="block text-xs text-zinc-500 mb-1.5">{t("create.title")}</label>
                              <input
                                type="text"
                                value={scene.title}
                                onChange={(e) => updateSceneField(index, "title", e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-zinc-500 mb-1.5">{t("create.duration")}</label>
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
                            <label className="block text-xs text-zinc-500 mb-1.5">{t("create.background")}</label>
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

                        {/* Right: Single-scene preview */}
                        <div className="lg:w-[45%] lg:shrink-0">
                          <div className="sticky top-32">
                            <label className="block text-xs text-zinc-500 mb-1.5">{t("common.preview")}</label>
                            <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black">
                              <ScenePreview scene={scene} />
                            </div>
                          </div>
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
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-5">{t("common.render")}</h2>

          {renderState === "idle" && (
            <div className="flex gap-3">
              <button
                onClick={startRender}
                disabled={scenes.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                {t("create.renderCloud")}
              </button>
              <button
                onClick={handleExportPptx}
                disabled={scenes.length === 0}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6M9 15l3 3 3-3" />
                </svg>
                {t("create.exportPpt")}
              </button>
            </div>
          )}

          {renderState === "rendering" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">{t("create.rendering")}</span>
                <span className="text-sm font-mono text-zinc-400">{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600 mt-2">{t("create.renderingNote")}</p>
            </div>
          )}

          {renderState === "done" && outputUrl && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-green-400 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="font-medium">{t("create.renderComplete")}</span>
              </div>
              <div className="flex gap-3 justify-center">
                <a
                  href={outputUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors inline-block"
                >
                  {t("create.downloadVideo")}
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
                  {t("create.renderAgain")}
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
                {t("common.tryAgain")}
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

  const tabs: { id: Mode; labelKey: string; zhLabelKey: string; icon: React.ReactNode }[] = [
    { id: "template", labelKey: "create.template", zhLabelKey: "create.templateCn", icon: <TemplateIcon /> },
    { id: "creative", labelKey: "create.creative", zhLabelKey: "create.creativeCn", icon: <CreativeIcon /> },
  ];

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="VidCraft AI" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold text-white tracking-tight">{t("common.vidcraft")}</span>
            </a>
          </div>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-white font-medium px-3 py-2 rounded-lg bg-zinc-800">{t("common.video")}</span>
            <a href="/poster" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("common.poster")}</a>
            <a href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("common.dashboard")}</a>
            <LanguageSelector />
            <UserMenu />
          </nav>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="sticky top-[65px] z-40 bg-[#09090b]/90 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
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
                <span>{t(tab.labelKey)}</span>
                <span className="text-xs opacity-60">({t(tab.zhLabelKey)})</span>
                {/* Active indicator */}
                {mode === tab.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 flex-1">
        {/* ============================================================ */}
        {/* MODE: TEMPLATE                                               */}
        {/* ============================================================ */}
        {mode === "template" && (
          <>
            {/* Step 1: Generate */}
            <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
                {t("create.generateVideo")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">{t("create.topicLabel")}</label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t("create.topicPlaceholder")}
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">{t("create.aiModel")}</label>
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
                  <label className="block text-xs text-zinc-500 mb-2">{t("create.voice")}</label>
                  <VoiceSelector value={selectedVoice} onChange={setSelectedVoice} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">{t("create.targetDuration")}</label>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setTargetDuration(d.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                          targetDuration === d.value
                            ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        {d.label}
                        <span className="ml-1.5 text-xs opacity-60">{t(DURATION_DESC_KEYS[d.description])}</span>
                      </button>
                    ))}
                  </div>
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
                      {progressText || t("create.generating")}
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      {t("create.generateVideo")}
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
                {t("create.creativeAnimation")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">{t("create.creativeTopic")}</label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t("create.creativePlaceholder")}
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">{t("create.aiModel")}</label>
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
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">{t("create.targetDuration")}</label>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setTargetDuration(d.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                          targetDuration === d.value
                            ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        {d.label}
                        <span className="ml-1.5 text-xs opacity-60">{t(DURATION_DESC_KEYS[d.description])}</span>
                      </button>
                    ))}
                  </div>
                </div>
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
                      {progressText || t("create.generating")}
                    </>
                  ) : (
                    <>
                      <CreativeIcon />
                      {t("create.generateAnimation")}
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Preview */}
            {creativeCode && (
              <section>
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">{t("common.preview")}</h2>
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black">
                  <DynamicRenderer
                    code={creativeCode}
                    durationInFrames={creativeDuration}
                    audioUrl={creativeAudioUrl ?? undefined}
                    captions={creativeCaptions}
                  />
                </div>
              </section>
            )}

            {/* Generated Code */}
            {creativeCode && (
              <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{t("create.generatedCode")}</h2>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(creativeCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                        {t("common.copied")}
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                        {t("common.copy")}
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#1e1e2e] rounded-lg p-4 overflow-x-auto text-sm text-[#e0def4] font-mono leading-relaxed max-h-96 overflow-y-auto">
                  {creativeCode}
                </pre>
              </section>
            )}

            {/* Render Section for Creative */}
            {creativeCode && (
              <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-5">{t("common.render")}</h2>

                {renderState === "idle" && (
                  <button
                    onClick={startCreativeRender}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                    {t("create.renderDownload")}
                  </button>
                )}

                {renderState === "rendering" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">{t("create.rendering")}</span>
                      <span className="text-sm font-mono text-zinc-400">{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                    </div>
                  </div>
                )}

                {renderState === "done" && outputUrl && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-green-400 mb-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                      <span className="font-medium">{t("create.renderComplete")}</span>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <a href={outputUrl} target="_blank" rel="noopener noreferrer" className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors inline-block">{t("create.downloadVideo")}</a>
                      <button onClick={() => { setRenderState("idle"); setRenderId(null); setBucketName(null); setProgress(0); setOutputUrl(null); }} className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors cursor-pointer">{t("create.renderAgain")}</button>
                    </div>
                  </div>
                )}

                {renderState === "error" && (
                  <div>
                    <div className="bg-red-950/50 border border-red-900 rounded-lg p-4 mb-4"><p className="text-red-400 text-sm">{error}</p></div>
                    <button onClick={() => { setRenderState("idle"); setError(null); }} className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors cursor-pointer">{t("common.tryAgain")}</button>
                  </div>
                )}
              </section>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-zinc-600 text-xs mt-auto pb-10 pt-16">
        {t("common.footer")}
      </footer>
    </div>
  );
}
