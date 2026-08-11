import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const MODEL = "claude-haiku-4-5-20251001";

interface GenerateResult {
  textos: string[];
  color_acento: string;
  icono_keyword: string;
  duracion_segundos: number;
}

// Mientras la API key no tenga créditos, USE_MOCK evita llamar a Anthropic
// y devuelve un resultado fijo para poder construir y probar el resto del flujo.
const USE_MOCK = true;

const MOCK_RESULT: GenerateResult = {
  textos: ["La inflamación protege", "pero también destruye", "el equilibrio es vital"],
  color_acento: "#00C2FF",
  icono_keyword: "heart",
  duracion_segundos: 6,
};

const outputSchema = {
  type: "object",
  properties: {
    textos: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
      description:
        "2 a 4 frases cortas, en español, derivadas del texto del usuario, listas para mostrarse en un video.",
    },
    color_acento: {
      type: "string",
      description:
        "Color de acento en formato hexadecimal (ej. #FF5733), elegido según el tono/tema del texto.",
    },
    icono_keyword: {
      type: "string",
      description:
        "Una sola palabra en inglés (minúsculas, sin espacios) para buscar un ícono equivalente en la librería Lucide.",
    },
    duracion_segundos: {
      type: "number",
      minimum: 3,
      maximum: 10,
      description: "Duración sugerida del video en segundos, entre 3 y 10.",
    },
  },
  required: ["textos", "color_acento", "icono_keyword", "duracion_segundos"],
  additionalProperties: false,
} as const;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido en el cuerpo de la solicitud" }, { status: 400 });
  }

  const prompt = (body as { prompt?: unknown } | null)?.prompt;
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "El campo 'prompt' es requerido" }, { status: 400 });
  }

  if (USE_MOCK) {
    return NextResponse.json(MOCK_RESULT);
  }

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      system:
        "Convierte el texto del usuario en contenido estructurado para un video corto. Responde siempre en español.",
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: { type: "json_schema", schema: outputSchema },
      },
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return NextResponse.json(
        { error: "No se pudo generar una respuesta válida" },
        { status: 502 },
      );
    }

    return NextResponse.json(response.parsed_output as GenerateResult);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }
    return NextResponse.json({ error: "Error inesperado generando el contenido" }, { status: 500 });
  }
}
