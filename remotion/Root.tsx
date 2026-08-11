import React from "react";
import { Composition, registerRoot, type AnyZodObject } from "remotion";
import { KineticText, type KineticTextProps } from "./compositions/KineticText";

const FPS = 30;

const defaultProps: KineticTextProps = {
  textos: ["La inflamación protege", "pero también destruye", "el equilibrio es vital"],
  color_acento: "#00C2FF",
  icono_keyword: "heart",
  duracion_segundos: 6,
  transparentBackground: false,
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition<AnyZodObject, KineticTextProps>
      id="KineticText"
      component={KineticText}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={Math.round(defaultProps.duracion_segundos * FPS)}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.round(props.duracion_segundos * FPS),
      })}
    />
  );
};

registerRoot(RemotionRoot);
