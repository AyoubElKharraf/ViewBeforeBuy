import { generateText } from "ai";
import { createAiGatewayProvider } from "../ai/gateway.js";
import { SYSTEM_PROMPTS, type ChatRole } from "../ai/prompts.js";

export type ChatInput = {
  message: string;
  role?: ChatRole;
  context?: string;
};

export async function chat(input: ChatInput): Promise<{ text: string }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing API key");

  const role = input.role ?? "agency";
  const gateway = createAiGatewayProvider(key);
  const system = SYSTEM_PROMPTS[role];
  const prompt = input.context
    ? `Contexte: ${input.context}\n\nQuestion: ${input.message}`
    : input.message;

  const { text } = await generateText({
    model: gateway("openai/gpt-5.5"),
    system,
    prompt,
  });

  return { text };
}
