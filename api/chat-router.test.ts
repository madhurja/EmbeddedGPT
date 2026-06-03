import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEmptyAdaptiveMemory,
  learnFromInteraction,
  summarizeAdaptiveMemory,
} from "@contracts/adaptive-learning";
import { generateAIResponse } from "./ai-router";
import { chatRouter, generateFallbackResponse } from "./chat-router";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("chat answer quality", () => {
  it("if the AI service is unavailable, the app still gives a useful ADS1115 answer instead of showing an error", () => {
    const result = generateFallbackResponse(
      "How do I interface ADS1115 with ESP32?"
    );

    expect(result.response.prose).toContain("ADS1115");
    expect(result.response.codeBlocks.length).toBeGreaterThan(0);
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pin: "SDA",
          notes: expect.stringContaining("GPIO21"),
        }),
      ])
    );
    expect(result.response.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "Texas Instruments" }),
      ])
    );
    expect(result.response.qualityGate?.targetAccuracy).toContain("85%+");
    expect(result.response.qualityGate?.sourceGrounding).toContain("official");
    expect(result.response.answerAudit?.detectedBoards).toEqual(
      expect.arrayContaining(["ESP32"])
    );
    expect(result.response.answerAudit?.detectedDomains).toEqual(
      expect.arrayContaining(["Sensors and measurement"])
    );
    expect(result.response.answerAudit?.coverageScore).toBeGreaterThan(50);
  });

  it("if no AI key is set, the app does not make a broken call back to itself and still returns a helpful built-in answer", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const caller = chatRouter.createCaller({
      req: new Request("http://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    const result = await caller.ask({ question: "BME280 wiring" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.response.prose).toContain("BME280");
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pin: "SDA",
          notes: expect.stringContaining("GPIO21"),
        }),
      ])
    );
  });

  it("rejects whitespace-only questions at the API boundary instead of generating a vague fallback", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const caller = chatRouter.createCaller({
      req: new Request("http://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    await expect(caller.ask({ question: "   \n\t   " })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("answers a beginner ESP32 coding question with clear steps and runnable starter code", () => {
    const result = generateFallbackResponse("how to start a code for esp 32?");

    expect(result.response.prose).toContain("Install Arduino IDE");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("blink"),
          code: expect.stringContaining("pinMode"),
        }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([expect.stringContaining("USB cable")])
    );
  });

  it("uses adaptive local task memory as a hint without replacing datasheet checks", () => {
    const context =
      "Adaptive memory from earlier local tasks:\n- Answer style: beginner-friendly\n- Known boards: ESP32\n- User corrections/preferences: prefer GPIO4 for TRIG and GPIO5 for ECHO on my trainer board";

    const result = generateFallbackResponse(
      "How should I connect an HC-SR04 ultrasonic sensor?",
      context
    );

    expect(result.response.prose).toContain("Adaptive learning applied");
    expect(result.response.adaptiveLearning?.memoryUsed).toBe(true);
    expect(result.response.adaptiveLearning?.appliedHints).toEqual(
      expect.arrayContaining([expect.stringContaining("prefer GPIO4 for TRIG")])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([expect.stringContaining("adaptive memory")])
    );
    expect(result.response.qualityGate?.knownLimits).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Adaptive memory is a user preference hint"),
      ])
    );
  });

  it("marks unclear fallback answers with an 85% guarded quality gate and required details", () => {
    const result = generateFallbackResponse(
      "I want to make a hardware project but I do not know the parts yet"
    );

    expect(result.response.prose).toContain("Global fallback mode");
    expect(result.response.qualityGate?.targetAccuracy).toContain("85%+");
    expect(result.response.qualityGate?.sharpnessMode).toBe(
      "Source-grounded mode"
    );
    expect(result.response.qualityGate?.requiredUserDetails).toEqual(
      expect.arrayContaining([expect.stringContaining("Programming framework")])
    );
    expect(result.response.answerAudit?.openQuestions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Exact board or controller family"),
      ])
    );
  });

  it("learns board, framework, module, style, and safety preferences from the user's tasks", () => {
    const learned = learnFromInteraction(createEmptyAdaptiveMemory(), {
      question:
        "Please keep answers simple. My ESP32 Arduino ADS1115 logger is working and verified; prefer guarded precision for high voltage safety.",
    });
    const summary = summarizeAdaptiveMemory(learned);

    expect(learned.answerStyle).toBe("beginner-friendly");
    expect(learned.boardHints).toEqual(expect.arrayContaining(["ESP32"]));
    expect(learned.preferredFrameworks).toEqual(
      expect.arrayContaining(["Arduino"])
    );
    expect(learned.moduleHints).toEqual(expect.arrayContaining(["ADS1115"]));
    expect(learned.verifiedFacts.length).toBeGreaterThan(0);
    expect(learned.safetyPreferences.length).toBeGreaterThan(0);
    expect(summary).toContain("Adaptive memory");
  });

  it("when the AI service returns structured JSON, the app checks that it has the expected answer fields before showing it to the user", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    const aiPayload = {
      prose: "Use I2C with pull-up resistors.",
      codeBlocks: [],
      pinMapping: [
        {
          pin: "SDA",
          function: "I2C Data",
          direction: "Bidirectional",
          notes: "Use a pull-up resistor",
        },
      ],
      references: [
        {
          title: "Example Datasheet",
          url: "https://example.com/datasheet.pdf",
          source: "Vendor",
        },
      ],
      debugChecklist: ["Scan the I2C bus"],
      circuitNotes: "Keep traces short.",
    };

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(aiPayload) } }],
      }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAIResponse({
      question: "How should I wire I2C?",
      context:
        "Adaptive memory from earlier local tasks:\n- Answer style: beginner-friendly",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      })
    );
    const requestBody = JSON.parse(
      (fetchMock.mock.calls[0]?.[1] as RequestInit).body as string
    ) as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(requestBody.messages[1]?.content).toContain(
      "Local authoritative electronics notes"
    );
    expect(requestBody.messages[1]?.content).toContain("Adaptive/user context");
    expect(requestBody.messages[1]?.content).toContain("I2C");
    expect(result?.response).toEqual(aiPayload);
  });

  it("falls back cleanly when the AI service returns invalid JSON instead of breaking the chat flow", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "{not valid json" } }],
        }),
      } as Response)
    );

    const result = await generateAIResponse({
      question: "How do I interface ADS1115 with ESP32?",
    });

    expect(result).toBeNull();
  });
});
