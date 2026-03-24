"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import type { PosterElement } from "@/skills/poster/schema";
import { POSTER_FONTS } from "@/skills/poster/schema";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  POSTER_FONTS.map((f) => `family=${f.family.replace(/ /g, "+")}:wght@${f.weights.join(";")}`).join("&") +
  "&display=swap";

type Props = {
  width: number;
  height: number;
  background: string;
  elements: PosterElement[];
  onCanvasReady?: (canvas: fabric.Canvas) => void;
};

function parseGradientStops(bg: string): { offset: number; color: string }[] {
  const stops: { offset: number; color: string }[] = [];
  const re = /(#[0-9a-fA-F]{3,8})\s+(\d+)%/g;
  let m;
  while ((m = re.exec(bg)) !== null) {
    stops.push({ offset: parseInt(m[2]) / 100, color: m[1] });
  }
  return stops;
}

function parseGradientAngle(bg: string): number {
  const m = bg.match(/(\d+)deg/);
  return m ? parseInt(m[1]) : 135;
}

export default function PosterCanvas({ width, height, background, elements, onCanvasReady }: Props) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const initDone = useRef(false);

  // Scale to fit preview
  const maxW = 800;
  const scale = width > maxW ? maxW / width : 1;
  const displayW = Math.round(width * scale);
  const displayH = Math.round(height * scale);

  useEffect(() => {
    // Load Google Fonts
    if (!document.querySelector(`link[href*="fonts.googleapis.com"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!canvasElRef.current || initDone.current) return;
    initDone.current = true;

    // fabric.js v7 defaults to originX/Y "center" — override to "left"/"top"
    fabric.FabricObject.ownDefaults.originX = "left";
    fabric.FabricObject.ownDefaults.originY = "top";

    // Create canvas at display size, use zoom to map logical coords
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: displayW,
      height: displayH,
      selection: true,
    });
    canvas.setZoom(scale);
    fabricRef.current = canvas;

    const init = async () => {
      // Wait for fonts
      await document.fonts.ready;

      // Set background
      if (background.includes("gradient")) {
        const stops = parseGradientStops(background);
        const angle = parseGradientAngle(background);
        const rad = (angle * Math.PI) / 180;
        const coords = {
          x1: 0.5 - Math.cos(rad) * 0.5,
          y1: 0.5 - Math.sin(rad) * 0.5,
          x2: 0.5 + Math.cos(rad) * 0.5,
          y2: 0.5 + Math.sin(rad) * 0.5,
        };
        if (stops.length >= 2) {
          const bgRect = new fabric.Rect({
            left: 0,
            top: 0,
            width,
            height,
            selectable: false,
            evented: false,
            fill: new fabric.Gradient({
              type: "linear",
              coords: {
                x1: coords.x1 * width,
                y1: coords.y1 * height,
                x2: coords.x2 * width,
                y2: coords.y2 * height,
              },
              colorStops: stops,
            }),
          });
          canvas.add(bgRect);
          canvas.sendObjectToBack(bgRect);
        }
      } else {
        canvas.backgroundColor = background;
      }

      // Add elements
      for (const el of elements) {
        switch (el.type) {
          case "text": {
            const obj = new fabric.Textbox(el.text, {
              left: el.left,
              top: el.top,
              fontSize: el.fontSize,
              fontFamily: el.fontFamily,
              fill: el.fill,
              fontWeight: (el.fontWeight as string) || "normal",
              fontStyle: (el.fontStyle as "normal" | "italic") || "normal",
              textAlign: (el.textAlign || "left") as "left" | "center" | "right",
              underline: el.underline || false,
              width: el.width || undefined,
              lineHeight: el.lineHeight || 1.3,
              charSpacing: el.charSpacing || 0,
              opacity: el.opacity ?? 1,
              angle: el.angle || 0,
            });
            canvas.add(obj);
            break;
          }
          case "rect": {
            const obj = new fabric.Rect({
              left: el.left,
              top: el.top,
              width: el.width,
              height: el.height,
              fill: el.fill,
              rx: el.rx || 0,
              ry: el.ry || 0,
              stroke: el.stroke || undefined,
              strokeWidth: el.strokeWidth || 0,
              opacity: el.opacity ?? 1,
              angle: el.angle || 0,
            });
            canvas.add(obj);
            break;
          }
          case "circle": {
            const obj = new fabric.Circle({
              left: el.left,
              top: el.top,
              radius: el.radius,
              fill: el.fill,
              stroke: el.stroke || undefined,
              strokeWidth: el.strokeWidth || 0,
              opacity: el.opacity ?? 1,
            });
            canvas.add(obj);
            break;
          }
          case "line": {
            const obj = new fabric.Line([el.x1, el.y1, el.x2, el.y2], {
              stroke: el.stroke,
              strokeWidth: el.strokeWidth,
              opacity: el.opacity ?? 1,
            });
            canvas.add(obj);
            break;
          }
        }
      }

      canvas.renderAll();
      onCanvasReady?.(canvas);
    };

    init();

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      initDone.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, background, elements]);

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", display: "inline-block" }}>
      <canvas ref={canvasElRef} />
    </div>
  );
}
