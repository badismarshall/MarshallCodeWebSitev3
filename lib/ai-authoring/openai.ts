import OpenAI from "openai";

type OpenAIMessageContent = {
  text?: string;
};

type OpenAIMessageItem = {
  type?: string;
  content?: OpenAIMessageContent[];
};

type OpenAIResponseLike = {
  output_text?: string;
  output?: OpenAIMessageItem[];
};

/**
 * Build the OpenAI client from a resolved key (Settings → AI, DB wins with
 * OPENAI_API_KEY env fallback) and, optionally, a custom base URL (DB value
 * wins with OPENAI_BASE_URL env fallback). Callers that already ran the
 * authoring gate pass the runtime's values; the env-only default keeps older
 * paths working.
 */
export function createAIAuthoringOpenAIClient(
  resolvedApiKey?: string,
  resolvedBaseURL?: string,
): OpenAI {
  const apiKey = resolvedApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenAI API key is not configured");
  const baseURL = resolvedBaseURL?.trim() || process.env.OPENAI_BASE_URL?.trim();
  return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

export function extractOutputText(response: unknown): string {
  const candidate = response as OpenAIResponseLike;
  if (typeof candidate?.output_text === "string" && candidate.output_text.trim()) {
    return candidate.output_text.trim();
  }

  const chunks: string[] = [];
  for (const item of candidate?.output || []) {
    if (item?.type !== "message") continue;
    for (const content of item.content || []) {
      if (typeof content?.text === "string") chunks.push(content.text);
    }
  }

  return chunks.join("\n").trim();
}
