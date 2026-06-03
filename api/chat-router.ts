import { z } from "zod";
import { generateLocalEmbeddedResponse } from "@contracts/embedded-answer";
import { createRouter, publicQuery } from "./middleware";
import { generateAIResponse } from "./ai-router";

export const chatRouter = createRouter({
  ask: publicQuery
    .input(
      z.object({
        question: z.string().trim().min(1).max(4000),
        context: z.string().trim().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const generated = await generateAIResponse(input);
      return (
        generated ?? generateFallbackResponse(input.question, input.context)
      );
    }),
});

export function generateFallbackResponse(question: string, context?: string) {
  return generateLocalEmbeddedResponse(question, context);
}
