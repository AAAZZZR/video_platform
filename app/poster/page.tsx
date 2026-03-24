"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { POSTER_SIZES, type PosterElement } from "@/skills/poster/schema";
import { MODEL_OPTIONS } from "@/src/types";

const PosterCanvas = dynamic(
  () => import("@/app/components/PosterCanvas"),
  { ssr: false },
);

const PosterToolbar = dynamic(
  () => import("@/app/components/PosterToolbar"),
  { ssr: false },
);

type CanvasInstance = import("fabric").Canvas;

export default function PosterPage() {
  const [topic, setTopic] = useState("");
  const [selectedSize, setSelectedSize] = useState<(typeof POSTER_SIZES)[number]>(POSTER_SIZES[0]);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-20250514");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posterTitle, setPosterTitle] = useState("");
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  const [posterWidth, setPosterWidth] = useState(1080);
  const [posterHeight, setPosterHeight] = useState(1080);
  const [posterBg, setPosterBg] = useState<string | null>(null);
  const [posterElements, setPosterElements] = useState<PosterElement[] | null>(null);
  const [canvasInstance, setCanvasInstance] = useState<CanvasInstance | null>(null);

  const width = selectedSize.id === "custom" ? customWidth : selectedSize.width;
  const height = selectedSize.id === "custom" ? customHeight : selectedSize.height;

  const handleCanvasReady = useCallback((c: CanvasInstance) => {
    setCanvasInstance(c);
  }, []);

  const generatePoster = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError(null);
    setPosterBg(null);
    setPosterElements(null);
    setCanvasInstance(null);

    try {
      const res = await fetch("/api/poster/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, model: selectedModel, width, height }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setPosterTitle(data.title || "poster");
      setPosterWidth(data.width);
      setPosterHeight(data.height);
      setPosterBg(data.background);
      setPosterElements(data.elements);
      setDetectedSkills(data.detectedSkills || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate poster");
    } finally {
      setGenerating(false);
    }
  };

  const downloadPng = () => {
    if (!canvasInstance) return;
    // Export at full resolution (undo the preview zoom)
    const currentZoom = canvasInstance.getZoom();
    canvasInstance.setZoom(1);
    canvasInstance.setDimensions({ width: posterWidth, height: posterHeight });
    const dataUrl = canvasInstance.toDataURL({ format: "png", multiplier: 2 } as never);
    canvasInstance.setZoom(currentZoom);
    canvasInstance.setDimensions({
      width: Math.round(posterWidth * currentZoom),
      height: Math.round(posterHeight * currentZoom),
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${posterTitle || "poster"}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">VidCraft AI</span>
            </a>
          </div>
          <nav className="flex items-center gap-4">
            <a href="/create" className="text-sm text-zinc-400 hover:text-white transition-colors">Video</a>
            <span className="text-sm text-white font-medium px-3 py-2 rounded-lg bg-zinc-800">Poster</span>
            <a href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">Dashboard</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Input Section */}
        <section className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Poster</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Describe your poster</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. A music festival poster for 'Summer Beats 2026' on August 15 at Taipei Arena, featuring DJ Shadow and Aurora"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Size</label>
                <select
                  value={selectedSize.id}
                  onChange={(e) => {
                    const found = POSTER_SIZES.find((s) => s.id === e.target.value);
                    if (found) setSelectedSize(found);
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {POSTER_SIZES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.width}x{s.height})
                    </option>
                  ))}
                </select>
                {selectedSize.id === "custom" && (
                  <div className="flex gap-2 mt-2">
                    <input type="number" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))} className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white" placeholder="Width" />
                    <span className="text-zinc-500 self-center">x</span>
                    <input type="number" value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))} className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white" placeholder="Height" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">AI Model</label>
                <div className="flex gap-2">
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                        selectedModel === m.id
                          ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={generatePoster}
              disabled={generating || !topic.trim()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating poster...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Generate Poster
                </>
              )}
            </button>
          </div>
        </section>

        {/* Detected Skills */}
        {detectedSkills.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-600">Skills used:</span>
            {detectedSkills.map((skill) => (
              <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Canvas Editor */}
        {posterBg && posterElements && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Editor</h2>
              <button
                onClick={downloadPng}
                disabled={!canvasInstance}
                className="text-sm bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                Download PNG
              </button>
            </div>

            <PosterToolbar canvas={canvasInstance} />

            <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800 bg-[#09090b] flex justify-center py-8">
              <PosterCanvas
                width={posterWidth}
                height={posterHeight}
                background={posterBg}
                elements={posterElements}
                onCanvasReady={handleCanvasReady}
              />
            </div>
          </section>
        )}

        <footer className="text-center text-zinc-600 text-xs mt-16 pb-10">
          VidCraft AI — Poster Generator
        </footer>
      </main>
    </div>
  );
}
