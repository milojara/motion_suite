import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { dynamicIconImports, type IconName } from "lucide-react/dynamic";
import type { LucideIcon } from "lucide-react";

// Mismo shape que GenerateResult en app/api/ai/generate/route.ts.
// Extiende Record<string, unknown> para satisfacer el constraint de
// <Composition> / <Player> de Remotion sobre el tipo de props.
export interface GenerateResult extends Record<string, unknown> {
  textos: string[];
  color_acento: string;
  icono_keyword: string;
  duracion_segundos: number;
}

export interface KineticTextProps extends GenerateResult {
  // true solo cuando se renderiza con un codec/pixelFormat que soporta canal
  // alfa (ej. ProRes 4444, VP8/WebM). En el Player normal debe quedar en
  // false para ver el fondo negro.
  transparentBackground?: boolean;
}

const FONT_FAMILY =
  '"Helvetica Neue", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const BACKGROUND_COLOR = "#0a0a0a";

function toIconName(keyword: string): IconName {
  return keyword.trim().toLowerCase().replace(/\s+/g, "-") as IconName;
}

function AnimatedIcon({ keyword, color }: { keyword: string; color: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [Icon, setIcon] = useState<LucideIcon | null>(null);

  // delayRender/continueRender aseguran que, al exportar con el CLI de
  // Remotion, el ícono ya esté cargado antes de capturar cualquier frame.
  useEffect(() => {
    const [handle] = [delayRender(`Cargando ícono: ${keyword}`)];
    const name = toIconName(keyword);
    const loader = dynamicIconImports[name] ?? dynamicIconImports.sparkles;

    let cancelled = false;
    loader()
      .then((mod) => {
        if (!cancelled) setIcon(() => mod.default);
      })
      .catch(() => {
        // deja Icon en null; el fallback simplemente no renderiza nada
      })
      .finally(() => continueRender(handle));

    return () => {
      cancelled = true;
    };
  }, [keyword]);

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 140 },
    durationInFrames: 20,
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.4, 1]);
  const translateY = interpolate(entrance, [0, 1], [-24, 0]);

  if (!Icon) return null;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={120} strokeWidth={2} color={color} />
    </div>
  );
}

function Phrase({ text, accentColor }: { text: string; accentColor: string }) {
  // Frame relativo al inicio de este Sequence (cada frase reinicia en 0).
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 130 },
    durationInFrames: 18,
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [60, 0]);

  const words = text.trim().split(/\s+/).filter(Boolean);
  const lastWord = words.pop() ?? "";
  const leadingWords = words.join(" ");

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          fontFamily: FONT_FAMILY,
          fontWeight: 800,
          fontSize: 88,
          lineHeight: 1.15,
          color: "#f5f5f5",
          textAlign: "center",
          maxWidth: "85%",
          textWrap: "balance" as React.CSSProperties["textWrap"],
        }}
      >
        {leadingWords ? `${leadingWords} ` : ""}
        <span style={{ color: accentColor }}>{lastWord}</span>
      </div>
    </AbsoluteFill>
  );
}

// Alto fijo del área del ícono. Antes el área de texto usaba flex: "1 1 auto"
// para calcular su alto, pero su único contenido son <Sequence> (que Remotion
// envuelve en position:absolute) — y los elementos absolutamente posicionados
// NO contribuyen al tamaño intrínseco/auto de su padre flex. Eso podía dejar
// el contenedor de texto con una caja de alto ~0 (opacity/transform correctos
// pero sin área visible). Se reemplaza por posiciones absolutas explícitas.
const ICON_AREA_HEIGHT = 280;

export const KineticText: React.FC<KineticTextProps> = ({
  textos,
  color_acento,
  icono_keyword,
  transparentBackground = false,
}) => {
  const { durationInFrames, height } = useVideoConfig();

  const phrases = textos.length > 0 ? textos : [""];
  const framesPerPhrase = Math.max(1, Math.floor(durationInFrames / phrases.length));
  const textAreaHeight = Math.max(0, height - ICON_AREA_HEIGHT);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparentBackground ? "transparent" : BACKGROUND_COLOR,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: ICON_AREA_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatedIcon keyword={icono_keyword} color={color_acento} />
      </div>

      <div
        style={{
          position: "absolute",
          top: ICON_AREA_HEIGHT,
          left: 0,
          width: "100%",
          height: textAreaHeight,
        }}
      >
        {phrases.map((texto, index) => {
          const from = index * framesPerPhrase;
          const isLast = index === phrases.length - 1;
          const duration = isLast ? durationInFrames - from : framesPerPhrase;

          return (
            <Sequence key={`${index}-${texto}`} from={from} durationInFrames={duration}>
              <Phrase text={texto} accentColor={color_acento} />
            </Sequence>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
