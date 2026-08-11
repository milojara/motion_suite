import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { NextRequest, NextResponse } from "next/server";
import type { GenerateResult } from "@/remotion/compositions/KineticText";

export const runtime = "nodejs";

const COMPOSITION_ID = "KineticText";
const ENTRY_POINT = path.join(process.cwd(), "remotion", "Root.tsx");

// bundle() invoca webpack por debajo y es costoso — se hace una sola vez por
// proceso del servidor y se reutiliza en todos los requests siguientes.
let bundleLocationPromise: Promise<string> | null = null;
function getBundleLocation(): Promise<string> {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({ entryPoint: ENTRY_POINT }).catch((error) => {
      bundleLocationPromise = null; // permite reintentar en el próximo request si falló
      throw error;
    });
  }
  return bundleLocationPromise;
}

type RenderFormat = "mp4" | "mov";

interface RenderRequestBody extends GenerateResult {
  format: RenderFormat;
}

function isValidBody(body: unknown): body is RenderRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Partial<RenderRequestBody>;
  return (
    (b.format === "mp4" || b.format === "mov") &&
    Array.isArray(b.textos) &&
    b.textos.length > 0 &&
    b.textos.every((t) => typeof t === "string") &&
    typeof b.color_acento === "string" &&
    typeof b.icono_keyword === "string" &&
    typeof b.duracion_segundos === "number"
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido en el cuerpo de la solicitud" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Body inválido: se requieren textos, color_acento, icono_keyword, duracion_segundos y format ('mp4' | 'mov')" },
      { status: 400 },
    );
  }

  const { format, textos, color_acento, icono_keyword, duracion_segundos } = body;

  // .mov con canal alfa solo tiene sentido sin fondo pintado; .mp4 siempre
  // lleva el fondo negro por defecto de la composición.
  const inputProps: GenerateResult & { transparentBackground: boolean } = {
    textos,
    color_acento,
    icono_keyword,
    duracion_segundos,
    transparentBackground: format === "mov",
  };

  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), "frameflow-render-"));
  const outputLocation = path.join(outputDir, `output.${format}`);

  try {
    const serveUrl = await getBundleLocation();

    const composition = await selectComposition({
      serveUrl,
      id: COMPOSITION_ID,
      inputProps,
    });

    if (format === "mp4") {
      await renderMedia({
        composition,
        serveUrl,
        inputProps,
        outputLocation,
        codec: "h264",
      });
    } else {
      await renderMedia({
        composition,
        serveUrl,
        inputProps,
        outputLocation,
        codec: "prores",
        proResProfile: "4444",
        pixelFormat: "yuva444p10le",
        // Los frames deben capturarse como PNG para preservar el canal
        // alfa antes de que ffmpeg los codifique a ProRes 4444.
        imageFormat: "png",
      });
    }

    const file = await fs.readFile(outputLocation);
    const contentType = format === "mp4" ? "video/mp4" : "video/quicktime";
    const filename = `kinetic-text-${crypto.randomUUID().slice(0, 8)}.${format}`;

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(file.byteLength),
      },
    });
  } catch (error) {
    console.error("[api/render] Error al renderizar:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado al renderizar el video" },
      { status: 500 },
    );
  } finally {
    await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {});
  }
}
