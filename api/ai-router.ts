import { z } from "zod";
import { buildKnowledgeBrief } from "@contracts/electronics-knowledge";
import { createRouter, publicQuery } from "./middleware";

const chatInputSchema = z.object({
  question: z.string().trim().min(1).max(4000),
  context: z.string().trim().optional(),
});

const embeddedResponseSchema = z.object({
  prose: z.string(),
  codeBlocks: z
    .array(
      z.object({
        language: z.string(),
        code: z.string(),
        description: z.string().optional(),
      })
    )
    .default([]),
  pinMapping: z
    .array(
      z.object({
        pin: z.string(),
        function: z.string(),
        direction: z.string(),
        notes: z.string().optional(),
      })
    )
    .default([]),
  references: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        source: z.string().optional(),
      })
    )
    .default([]),
  debugChecklist: z.array(z.string()).default([]),
  circuitNotes: z.string().optional(),
  adaptiveLearning: z
    .object({
      memoryUsed: z.boolean(),
      appliedHints: z.array(z.string()).default([]),
      confidenceTarget: z.string(),
    })
    .optional(),
  qualityGate: z
    .object({
      targetAccuracy: z.string(),
      sourceGrounding: z.string(),
      sharpnessMode: z.string(),
      knownLimits: z.array(z.string()).default([]),
      requiredUserDetails: z.array(z.string()).default([]),
      nextVerification: z.array(z.string()).default([]),
    })
    .optional(),
  answerAudit: z
    .object({
      detectedDomains: z.array(z.string()).default([]),
      detectedBoards: z.array(z.string()).default([]),
      detectedProtocols: z.array(z.string()).default([]),
      riskLevel: z.enum(["Low", "Medium", "High", "Critical"]),
      difficulty: z.string(),
      coverageScore: z.number().min(0).max(100),
      openQuestions: z.array(z.string()).default([]),
      improvementActions: z.array(z.string()).default([]),
    })
    .optional(),
  precision: z
    .object({
      level: z.string(),
      confidence: z.enum(["High", "Medium", "Needs bench verification"]),
      assumptions: z.array(z.string()).default([]),
      safetyWarnings: z.array(z.string()).default([]),
      verificationSteps: z.array(z.string()).default([]),
      missingDetails: z.array(z.string()).default([]),
      calculationNotes: z.array(z.string()).default([]),
      validationGates: z.array(z.string()).default([]),
      riskControls: z.array(z.string()).default([]),
      releaseCriteria: z.array(z.string()).default([]),
      errorBudgetNotes: z.array(z.string()).default([]),
    })
    .optional(),
});

type ChatInput = z.infer<typeof chatInputSchema>;
export type EmbeddedResponse = z.infer<typeof embeddedResponseSchema>;

export async function generateAIResponse(
  input: ChatInput
): Promise<{ response: EmbeddedResponse } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const timeoutMs = Math.max(
    1000,
    Number.parseInt(process.env.AI_TIMEOUT_MS ?? "8000", 10)
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const knowledgeBrief = buildKnowledgeBrief(input.question);

  // Structured prompt for embedded engineering responses
  const systemPrompt = `You are EmbeddedGPT, a careful engineering assistant for electronics, embedded systems, firmware, and practical technical questions.
Your responses must be structured JSON with these fields:
- prose: explanatory text (markdown supported)
- codeBlocks: array of {language, code, description} for working code examples
- pinMapping: array of {pin, function, direction, notes} for hardware connections
- references: array of {title, url, source} for datasheets and docs
- debugChecklist: array of strings for troubleshooting steps
- circuitNotes: string with wiring guidance
- adaptiveLearning: optional object with {memoryUsed, appliedHints, confidenceTarget}
- qualityGate: optional object with {targetAccuracy, sourceGrounding, sharpnessMode, knownLimits, requiredUserDetails, nextVerification}
- answerAudit: optional object with {detectedDomains, detectedBoards, detectedProtocols, riskLevel, difficulty, coverageScore, openQuestions, improvementActions}
- precision: optional object with {level, confidence, assumptions, safetyWarnings, verificationSteps, missingDetails, calculationNotes, validationGates, riskControls, releaseCriteria, errorBudgetNotes}

Rules:
- Start with the direct practical answer, then explain why.
- Prefer beginner-understandable language without becoming vague.
- For electronics, separate answer into power, wiring, code, and checks when helpful.
- Code must be complete enough to compile or run after the user fills obvious placeholders.
- Pin mappings must match actual chip pinouts or clearly say when the board variant must be checked.
- Reference only real, verifiable datasheets or official docs.
- Include both Arduino and ESP-IDF code when ESP32 users clearly need depth, otherwise keep the first answer simple.
- Voltage levels, current limits, boot pins, reserved pins, pull-ups, and grounding must be called out when relevant.
- If the question is outside electronics, still answer helpfully, but do not invent hardware facts.
- Always include a debug checklist.
- For high-risk electronics, include Level 16 precision with safety warnings, missing details, calculations, error budget notes, validation gates, risk controls, and release criteria.
- Do not present an unverified production design as final. State what must be bench-tested or reviewed.
- If adaptive context is supplied, use it only as remembered user preference or prior-task hints. Do not let memory override datasheets, safety warnings, or exact board documentation.
- When adaptive context changes your answer, include adaptiveLearning with the key hints you used.
- Include qualityGate for every hardware, firmware, IoT, STM32, Arduino, Raspberry Pi, ESP32, sensor, or EV answer. Be explicit about target accuracy, exact source grounding, missing user details, and next verification checks.
- Include answerAudit for every technical answer. Classify detected domains, boards, protocols, risk level, difficulty out of 16, coverage score from 0-100, open questions, and actions that would improve precision.

Respond ONLY with valid JSON matching the schema.`;

  const userPrompt = `Question: ${input.question}
${input.context ? `Adaptive/user context: ${input.context}` : ""}

Local authoritative electronics notes to use when relevant:
${knowledgeBrief}

Provide a comprehensive embedded engineering response with working code, pin mapping, datasheet references, and debug checklist.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("AI service returned an empty response");
    }

    const parsed = JSON.parse(content) as unknown;
    const responseCandidate =
      parsed && typeof parsed === "object" && "response" in parsed
        ? (parsed as { response: unknown }).response
        : parsed;

    return { response: embeddedResponseSchema.parse(responseCandidate) };
  } catch (error) {
    console.warn(
      "[ai] Falling back to the local answer engine:",
      error instanceof Error ? error.message : "unknown error"
    );
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const aiRouter = createRouter({
  chat: publicQuery
    .input(chatInputSchema)
    .mutation(async ({ input }) => generateAIResponse(input)),
});
