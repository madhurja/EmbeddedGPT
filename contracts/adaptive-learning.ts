import type { EmbeddedResponse } from "./embedded-answer";

export interface AdaptiveLearningMemory {
  profileVersion: 1;
  answerStyle: "beginner-friendly" | "balanced" | "expert";
  preferredFrameworks: string[];
  boardHints: string[];
  moduleHints: string[];
  verifiedFacts: string[];
  corrections: string[];
  recentTasks: string[];
  safetyPreferences: string[];
  updatedAt: string;
}

interface LearningInteraction {
  question: string;
  response?: Pick<
    EmbeddedResponse,
    "references" | "pinMapping" | "debugChecklist" | "precision"
  >;
}

const MAX_ITEMS = 8;

const boardPatterns: Array<[string, RegExp]> = [
  ["ESP32", /\besp\s*32\b|\besp32\b/i],
  ["Arduino UNO R4 WiFi", /\buno\s*r4\b/i],
  ["Arduino UNO", /\buno\b/i],
  ["Arduino Nano", /\bnano\b/i],
  ["Arduino Mega 2560", /\bmega\s*2560\b|\bmega\b/i],
  ["Raspberry Pi", /\braspberry\s*pi\b|\brpi\b|\br-pi\b/i],
  ["Raspberry Pi Pico", /\bpico\b|\brp2040\b|\brp2350\b/i],
  ["STM32", /\bstm32\b|\bcubeide\b|\bcubemx\b/i],
];

const frameworkPatterns: Array<[string, RegExp]> = [
  ["Arduino", /\barduino\b/i],
  ["ESP-IDF", /\besp-idf\b|\bidf\b/i],
  ["STM32 HAL", /\bstm32\b|\bhal\b|\bcubeide\b|\bcubemx\b/i],
  ["MicroPython", /\bmicropython\b/i],
  ["Python", /\bpython\b|\bgpiozero\b/i],
  ["FreeRTOS", /\bfreertos\b|\brtos\b/i],
];

const modulePatterns: Array<[string, RegExp]> = [
  ["ADS1115", /\bads1115\b/i],
  ["BME280", /\bbme280\b/i],
  ["BMP280", /\bbmp280\b/i],
  ["DHT22/DHT11", /\bdht22\b|\bdht11\b|\bdht\b/i],
  ["HC-SR04", /\bhc-sr04\b|\bhcsr04\b|\bultrasonic\b/i],
  ["MQTT", /\bmqtt\b/i],
  ["Ethernet/LwIP", /\bethernet\b|\blwip\b/i],
  ["RS485/CAN", /\brs485\b|\bcan bus\b/i],
  ["EV BMS", /\bbms\b|\bbattery management\b/i],
  ["EV traction inverter", /\btraction inverter\b|\bmotor controller\b/i],
];

export function createEmptyAdaptiveMemory(): AdaptiveLearningMemory {
  return {
    profileVersion: 1,
    answerStyle: "balanced",
    preferredFrameworks: [],
    boardHints: [],
    moduleHints: [],
    verifiedFacts: [],
    corrections: [],
    recentTasks: [],
    safetyPreferences: [],
    updatedAt: new Date(0).toISOString(),
  };
}

export function normalizeAdaptiveMemory(
  value: unknown
): AdaptiveLearningMemory {
  const empty = createEmptyAdaptiveMemory();
  if (!value || typeof value !== "object") return empty;

  const candidate = value as Partial<AdaptiveLearningMemory>;
  return {
    profileVersion: 1,
    answerStyle:
      candidate.answerStyle === "beginner-friendly" ||
      candidate.answerStyle === "expert"
        ? candidate.answerStyle
        : candidate.answerStyle === "balanced"
          ? "balanced"
          : empty.answerStyle,
    preferredFrameworks: cleanList(candidate.preferredFrameworks),
    boardHints: cleanList(candidate.boardHints),
    moduleHints: cleanList(candidate.moduleHints),
    verifiedFacts: cleanList(candidate.verifiedFacts),
    corrections: cleanList(candidate.corrections),
    recentTasks: cleanList(candidate.recentTasks),
    safetyPreferences: cleanList(candidate.safetyPreferences),
    updatedAt:
      typeof candidate.updatedAt === "string"
        ? candidate.updatedAt
        : empty.updatedAt,
  };
}

export function summarizeAdaptiveMemory(memory: AdaptiveLearningMemory) {
  const lines = [
    `Answer style: ${memory.answerStyle}`,
    memory.preferredFrameworks.length
      ? `Preferred frameworks: ${memory.preferredFrameworks.join(", ")}`
      : "",
    memory.boardHints.length
      ? `Known boards: ${memory.boardHints.join(", ")}`
      : "",
    memory.moduleHints.length
      ? `Known modules/topics: ${memory.moduleHints.join(", ")}`
      : "",
    memory.verifiedFacts.length
      ? `Verified working notes: ${memory.verifiedFacts.join("; ")}`
      : "",
    memory.corrections.length
      ? `User corrections/preferences: ${memory.corrections.join("; ")}`
      : "",
    memory.safetyPreferences.length
      ? `Safety preferences: ${memory.safetyPreferences.join("; ")}`
      : "",
  ].filter(Boolean);

  if (lines.length === 1 && memory.answerStyle === "balanced") return "";
  return `Adaptive memory from earlier local tasks:\n- ${lines.join("\n- ")}`;
}

export function learnFromInteraction(
  memory: AdaptiveLearningMemory,
  interaction: LearningInteraction
): AdaptiveLearningMemory {
  const question = interaction.question.trim();
  const next = normalizeAdaptiveMemory(memory);
  const lower = question.toLowerCase();

  next.answerStyle = detectAnswerStyle(lower, next.answerStyle);
  next.boardHints = mergeDetected(next.boardHints, question, boardPatterns);
  next.preferredFrameworks = mergeDetected(
    next.preferredFrameworks,
    question,
    frameworkPatterns
  );
  next.moduleHints = mergeDetected(next.moduleHints, question, modulePatterns);

  if (
    /\bworked\b|\bworking\b|\bverified\b|\btested\b|\bsolved\b|\bfixed\b/i.test(
      question
    )
  ) {
    next.verifiedFacts = addLimited(
      next.verifiedFacts,
      compactSentence(question)
    );
  }

  if (
    /\bcorrection\b|\bactually\b|\bnot\b|\binstead\b|\bprefer\b|\buse\b/i.test(
      question
    )
  ) {
    const correction = extractCorrection(question);
    if (correction) {
      next.corrections = addLimited(next.corrections, correction);
    }
  }

  if (
    /\bsafety\b|\bprecise\b|\baccuracy\b|\bno error\b|\bhigh voltage\b|\bev\b|\bisolation\b|\bverified\b/i.test(
      question
    ) ||
    interaction.response?.precision?.level.includes("Level 16")
  ) {
    next.safetyPreferences = addLimited(
      next.safetyPreferences,
      "Prefer guarded precision, missing-detail checks, and bench verification."
    );
  }

  next.recentTasks = addLimited(next.recentTasks, compactSentence(question), 6);
  next.updatedAt = new Date().toISOString();
  return next;
}

export function adaptiveMemoryStats(memory: AdaptiveLearningMemory) {
  return {
    learnedItems:
      memory.preferredFrameworks.length +
      memory.boardHints.length +
      memory.moduleHints.length +
      memory.verifiedFacts.length +
      memory.corrections.length +
      memory.safetyPreferences.length,
    recentTasks: memory.recentTasks.length,
    answerStyle: memory.answerStyle,
  };
}

function detectAnswerStyle(
  text: string,
  current: AdaptiveLearningMemory["answerStyle"]
): AdaptiveLearningMemory["answerStyle"] {
  if (
    /\bbeginner\b|\beasy\b|\bsimple\b|\bless knowledge\b|\bexplain more\b|\bunderstandable\b/.test(
      text
    )
  ) {
    return "beginner-friendly";
  }
  if (
    /\bexpert\b|\badvanced\b|\blevel 16\b|\bformal\b|\bproduction\b|\bprecise\b/.test(
      text
    )
  ) {
    return "expert";
  }
  return current;
}

function mergeDetected(
  current: string[],
  text: string,
  patterns: Array<[string, RegExp]>
) {
  return patterns.reduce(
    (items, [label, pattern]) =>
      pattern.test(text) ? addLimited(items, label) : items,
    current
  );
}

function cleanList(value: unknown, limit = MAX_ITEMS) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => typeof item === "string")
    .map(item => item.trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, limit);
}

function addLimited(list: string[], item: string, limit = MAX_ITEMS) {
  const clean = item.trim();
  if (!clean) return list.slice(0, limit);
  return [clean, ...list.filter(existing => existing !== clean)].slice(
    0,
    limit
  );
}

function compactSentence(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 180);
}

function extractCorrection(text: string) {
  const compact = compactSentence(text);
  const match = compact.match(
    /\b(?:correction|actually|instead|prefer|use)\b[:\s-]*(.+)$/i
  );
  return match?.[1]?.trim().slice(0, 160) || compact;
}
