import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

async function generateTTS(text: string, voice: string): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(text);
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    audioStream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    audioStream.on("end", () => resolve(Buffer.concat(chunks)));
    audioStream.on("error", reject);
  });
}

export async function POST(request: Request) {
  try {
    const { scenes, voiceId } = await request.json();

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ error: "scenes array is required" }, { status: 400 });
    }

    const voice = voiceId || "en-US-JennyNeural";

    const s3 = new S3Client({
      region: process.env.REMOTION_AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY!,
      },
    });

    const bucket = process.env.REMOTION_S3_BUCKET!;
    const sessionId = `tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Process scenes sequentially to avoid WebSocket connection issues
    const updatedScenes = [];
    for (let index = 0; index < scenes.length; index++) {
      const scene = scenes[index];
      const narration = scene.narration;

      if (!narration || typeof narration !== "string" || narration.trim().length === 0) {
        updatedScenes.push(scene);
        continue;
      }

      try {
        const audioBuffer = await generateTTS(narration.trim(), voice);

        if (audioBuffer.length === 0) {
          console.warn(`Empty audio for scene ${index}`);
          updatedScenes.push(scene);
          continue;
        }

        // Upload to S3
        const key = `tts/${sessionId}/scene-${index}.mp3`;
        await s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: audioBuffer,
          ContentType: "audio/mpeg",
        }));

        // Generate presigned URL (valid for 2 hours)
        const audioUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: bucket, Key: key }),
          { expiresIn: 7200 },
        );

        updatedScenes.push({ ...scene, audioUrl });
      } catch (err) {
        console.error(`TTS error for scene ${index}:`, err);
        updatedScenes.push(scene); // Return scene without audio on error
      }
    }

    return NextResponse.json({ scenes: updatedScenes });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "TTS generation failed" },
      { status: 500 },
    );
  }
}
