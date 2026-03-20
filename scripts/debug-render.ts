/**
 * Debug a specific creative render on Lambda.
 * Shows detailed error messages from getRenderProgress.
 *
 * Usage: npx tsx scripts/debug-render.ts
 */

import { renderMediaOnLambda, getRenderProgress } from "@remotion/lambda/client";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const REGION = "us-east-1";
const FUNCTION_NAME = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;
const SERVE_URL = process.env.REMOTION_SERVE_URL!;

// Read code from file or use inline
const CODE = fs.existsSync("scripts/debug-code.tsx")
  ? fs.readFileSync("scripts/debug-code.tsx", "utf-8")
  : process.argv[2] || "";

if (!CODE) {
  console.error("Usage: put code in scripts/debug-code.tsx or pass as argument");
  process.exit(1);
}

async function main() {
  console.log("=== Debug Render ===");
  console.log(`Code length: ${CODE.length} chars`);

  // Extract duration from code
  const durationMatch = CODE.match(/\/\/\s*DURATION:\s*(\d+)/);
  const duration = durationMatch ? parseInt(durationMatch[1]) : 300;
  console.log(`Duration: ${duration} frames (${(duration / 30).toFixed(1)}s)`);

  try {
    console.log("\nStarting render...");
    const { renderId, bucketName } = await renderMediaOnLambda({
      region: REGION,
      functionName: FUNCTION_NAME,
      serveUrl: SERVE_URL,
      composition: "DynamicVideo",
      inputProps: { code: CODE },
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 1,
      privacy: "public",
      framesPerLambda: 200,
    });

    console.log(`Render ID: ${renderId}`);
    console.log(`Bucket: ${bucketName}`);

    let done = false;
    while (!done) {
      await new Promise((r) => setTimeout(r, 3000));

      const progress = await getRenderProgress({
        renderId,
        bucketName,
        region: REGION,
        functionName: FUNCTION_NAME,
      });

      const pct = Math.round((progress.overallProgress ?? 0) * 100);
      console.log(`Progress: ${pct}% | Chunks: ${progress.chunks ?? 0} | Frames encoded: ${progress.encodedFrames ?? 0}/${progress.totalFrames ?? "?"}`);

      if (progress.fatalErrorEncountered) {
        console.error("\n=== FATAL ERROR ===");
        if (progress.errors && progress.errors.length > 0) {
          for (const err of progress.errors) {
            console.error(`\nChunk: ${err.chunk}`);
            console.error(`Frame: ${err.frame}`);
            console.error(`Name: ${err.name}`);
            console.error(`Message: ${err.message}`);
            console.error(`Stack: ${err.stack}`);
          }
        } else {
          console.error("No detailed error info available.");
          console.error("Full progress:", JSON.stringify(progress, null, 2));
        }
        process.exit(1);
      }

      if (progress.done) {
        done = true;
        console.log(`\n=== SUCCESS ===`);
        console.log(`Output: ${progress.outputFile}`);
        console.log(`Time: ${progress.timeToFinish}ms`);
      }
    }
  } catch (err) {
    console.error("\n=== ERROR ===");
    console.error(err);
    process.exit(1);
  }
}

main();
