export type AISalesAgentModel =
  | "deepseek-flash"
  | "deepseek-v4-pro";

export type AISalesAgentReasoningEffort =
  | "minimal"
  | "low"
  | "medium"
  | "high";

export type AISalesAgentTone =
  | "friendly"
  | "professional"
  | "playful"
  | "luxury";

export const AI_SALES_AGENT_MODELS: ReadonlyArray<{
  id: AISalesAgentModel;
  label: string;
  reasoning: boolean;
}> = [
  { id: "deepseek-flash", label: "DeepSeek Flash", reasoning: false },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", reasoning: true },
];

export const AI_SALES_AGENT_MODEL_IDS = AI_SALES_AGENT_MODELS.map(
  (model) => model.id,
) as ReadonlyArray<AISalesAgentModel>;

export const AI_SALES_AGENT_REASONING_EFFORTS: ReadonlyArray<AISalesAgentReasoningEffort> =
  ["minimal", "low", "medium", "high"];

export const AI_SALES_AGENT_TONES: ReadonlyArray<AISalesAgentTone> = [
  "friendly",
  "professional",
  "playful",
  "luxury",
];

export const DEFAULT_AI_SALES_AGENT_MODEL: AISalesAgentModel = "deepseek-flash";

export function isReasoningModel(model: string): boolean {
  return AI_SALES_AGENT_MODELS.some(
    (entry) => entry.id === model && entry.reasoning,
  );
}
