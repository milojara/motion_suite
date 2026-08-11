"use client";

import { useState } from "react";
import { Player } from "@remotion/player";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { KineticText, type GenerateResult } from "@/remotion/compositions/KineticText";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Sparkles, Clock, Loader2, Download, FileVideo } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Debe coincidir con el fps de la composición registrada en remotion/Root.tsx
const FPS = 30;
const COMPOSITION_WIDTH = 1080;
const COMPOSITION_HEIGHT = 1920;

type RenderFormat = "mp4" | "mov";

function toIconName(keyword: string): IconName {
  return keyword
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") as IconName;
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [rendering, setRendering] = useState<RenderFormat | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Escribe un texto para generar contenido");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Error al generar el contenido");
      }

      setResult(data as GenerateResult);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar el contenido");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: RenderFormat) => {
    if (!result) return;

    setRendering(format);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result, format }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Error al renderizar el video");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kinetic-text.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al renderizar el video");
    } finally {
      setRendering(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50">Generar contenido</h1>
            <p className="text-sm text-zinc-400">
              Describe la idea del video y la IA generará los textos, el color de acento, el ícono y la
              duración sugerida.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Texto de entrada</CardTitle>
              <CardDescription>Escribe el tema o mensaje del video.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej. Anuncio de una cafetería nueva en el centro de la ciudad..."
                rows={5}
                disabled={loading}
              />
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="self-end"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.textos.join("|")}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${result.color_acento}20` }}
                      >
                        <DynamicIcon
                          name={toIconName(result.icono_keyword)}
                          className="h-7 w-7"
                          style={{ color: result.color_acento }}
                          fallback={() => <Sparkles className="h-7 w-7 text-zinc-500" />}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span
                            className="h-3 w-3 rounded-full border border-zinc-700"
                            style={{ backgroundColor: result.color_acento }}
                          />
                          {result.color_acento}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          {result.duracion_segundos}s
                        </div>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-2">
                      {result.textos.map((texto, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100"
                        >
                          {texto}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Vista previa</CardTitle>
                    <CardDescription>Formato vertical (1080×1920) para Reels/Shorts/TikTok.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-zinc-800">
                      <Player
                        component={KineticText}
                        inputProps={result}
                        durationInFrames={Math.max(1, Math.round(result.duracion_segundos * FPS))}
                        compositionWidth={COMPOSITION_WIDTH}
                        compositionHeight={COMPOSITION_HEIGHT}
                        fps={FPS}
                        style={{ width: "100%" }}
                        controls
                        loop
                      />
                    </div>

                    <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
                      <Button
                        onClick={() => handleDownload("mp4")}
                        disabled={rendering !== null}
                      >
                        {rendering === "mp4" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Renderizando MP4...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar MP4
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload("mov")}
                        disabled={rendering !== null}
                      >
                        {rendering === "mov" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Renderizando .mov...
                          </>
                        ) : (
                          <>
                            <FileVideo className="mr-2 h-4 w-4" />
                            Descargar sin fondo (.mov)
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs text-zinc-500">
                        El .mov incluye canal alfa (ProRes 4444) para usarlo sin fondo negro.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
