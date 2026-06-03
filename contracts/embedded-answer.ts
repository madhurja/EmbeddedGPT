import {
  checksFromKnowledge,
  factsFromKnowledge,
  findRelevantKnowledge,
  referencesFromKnowledge,
} from "./electronics-knowledge";

export interface CodeBlockData {
  language: string;
  code: string;
  description?: string;
}

export interface PinData {
  pin: string;
  function: string;
  direction: string;
  notes?: string;
}

export interface ReferenceData {
  title: string;
  url: string;
  source?: string;
}

export interface PrecisionReview {
  level: string;
  confidence: "High" | "Medium" | "Needs bench verification";
  assumptions: string[];
  safetyWarnings: string[];
  verificationSteps: string[];
  missingDetails: string[];
  calculationNotes: string[];
  validationGates?: string[];
  riskControls?: string[];
  releaseCriteria?: string[];
  errorBudgetNotes?: string[];
}

export interface AdaptiveLearningData {
  memoryUsed: boolean;
  appliedHints: string[];
  confidenceTarget: string;
}

export interface AccuracyQualityGate {
  targetAccuracy: string;
  sourceGrounding: string;
  sharpnessMode: string;
  knownLimits: string[];
  requiredUserDetails: string[];
  nextVerification: string[];
}

export interface AnswerAudit {
  detectedDomains: string[];
  detectedBoards: string[];
  detectedProtocols: string[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  difficulty: string;
  coverageScore: number;
  openQuestions: string[];
  improvementActions: string[];
}

export interface EmbeddedResponse {
  prose: string;
  codeBlocks: CodeBlockData[];
  pinMapping: PinData[];
  references: ReferenceData[];
  debugChecklist: string[];
  circuitNotes?: string;
  precision?: PrecisionReview;
  adaptiveLearning?: AdaptiveLearningData;
  qualityGate?: AccuracyQualityGate;
  answerAudit?: AnswerAudit;
}

export interface EmbeddedAnswer {
  response: EmbeddedResponse;
}

function includesAny(text: string, words: string[]) {
  return words.some(word => text.includes(word));
}

function mentionsEsp32(text: string) {
  return text.replace(/[\s-]+/g, "").includes("esp32");
}

function mentionsArduino(text: string) {
  return includesAny(text, [
    "arduino",
    "uno",
    "nano",
    "mega",
    "mkr",
    "portenta",
    "giga",
  ]);
}

function mentionsRaspberryPiSbc(text: string) {
  const compact = text.replace(/[\s_-]+/g, "");
  return (
    (compact.includes("raspberrypi") ||
      compact.includes("rpi") ||
      compact.includes("r-pi") ||
      includesAny(text, ["raspi", "pi 3", "pi 4", "pi 5", "zero"])) &&
    !includesAny(text, ["pico", "rp2040", "rp2350"])
  );
}

function hasEsp32StartIntent(text: string) {
  return (
    mentionsEsp32(text) &&
    includesAny(text, [
      "start",
      "begin",
      "first code",
      "first program",
      "how to code",
      "code for",
      "setup",
      "arduino ide",
    ])
  );
}

function isEmbeddedEcosystemQuestion(text: string) {
  return (
    includesAny(text, [
      "all kinds",
      "all boards",
      "all their documentation",
      "next level",
    ]) &&
    (mentionsArduino(text) ||
      mentionsRaspberryPiSbc(text) ||
      includesAny(text, ["sensor", "sensors", "communication", "circuits"]))
  );
}

function isArduinoBoardQuestion(text: string) {
  return (
    mentionsArduino(text) &&
    includesAny(text, [
      "pin",
      "pinout",
      "mapping",
      "i2c",
      "spi",
      "uart",
      "serial",
      "code",
      "start",
      "board",
      "boards",
      "uno",
      "nano",
      "mega",
    ])
  );
}

function isCommonSensorQuestion(text: string) {
  return includesAny(text, [
    "dht11",
    "dht22",
    "dht",
    "hc-sr04",
    "hcsr04",
    "ultrasonic",
    "servo",
    "mpu6050",
    "imu",
    "oled",
    "ssd1306",
    "pir",
    "gas sensor",
    "soil",
    "ldr",
    "photoresistor",
    "relay",
    "motor",
    "sensor",
    "sensors",
  ]);
}

function isCommunicationQuestion(text: string) {
  return includesAny(text, [
    "i2c",
    "spi",
    "uart",
    "serial",
    "rs485",
    "can bus",
    "can",
    "modbus",
    "onewire",
    "one wire",
    "mqtt",
    "communication",
    "protocol",
    "bus",
  ]);
}

function isInternetConnectivityQuestion(text: string) {
  return includesAny(text, [
    "internet",
    "wifi",
    "wi-fi",
    "ethernet",
    "http",
    "https",
    "tls",
    "cloud",
    "api",
    "websocket",
    "online",
    "server",
    "database",
    "firebase",
    "thingspeak",
    "lte",
    "gsm",
    "cellular",
    "nb-iot",
  ]);
}

function isBasicCircuitQuestion(text: string) {
  return includesAny(text, [
    "led resistor",
    "basic circuit",
    "button",
    "pullup",
    "pull-up",
    "pulldown",
    "pull-down",
    "voltage divider",
    "mosfet",
    "transistor",
    "relay",
    "flyback",
    "diode",
    "capacitor",
    "breadboard",
  ]);
}

function isEvQuestion(text: string) {
  const compact = ` ${text.replace(/[\s_-]+/g, " ")} `;
  return (
    compact.includes(" ev ") ||
    compact.includes(" hev ") ||
    compact.includes(" bms ") ||
    compact.includes(" obc ") ||
    includesAny(text, [
      "electric vehicle",
      "hybrid vehicle",
      "battery management",
      "cell balancing",
      "traction inverter",
      "motor controller",
      "precharge",
      "contactor",
      "dc-dc",
      "dcdc",
      "on-board charger",
      "obc",
      "high voltage",
      "hv battery",
      "battery pack",
      "regen",
      "regenerative",
      "isolation monitor",
      "thermal runaway",
    ])
  );
}

function isMachineLearningQuestion(text: string) {
  const compact = ` ${text.replace(/[\s_-]+/g, " ")} `;
  return includesAny(compact, [
    " machine learning ",
    " ml ",
    " artificial intelligence ",
    " ai ",
    " neural ",
    " model ",
    " tinyml ",
  ]);
}

function isIndustrialLoggerQuestion(text: string) {
  return (
    includesAny(text, ["industrial", "data logger", "datalogger", "logger"]) &&
    mentionsEsp32(text) &&
    includesAny(text, ["ads1115", "0-10v", "0 to 10v", "analog"]) &&
    includesAny(text, ["bme280", "temperature", "humidity", "pressure"]) &&
    includesAny(text, ["freertos", "task", "wifi", "wi-fi"])
  );
}

export function generateLocalEmbeddedResponse(
  question: string,
  adaptiveContext?: string
): EmbeddedAnswer {
  const normalized = question.toLowerCase().replace(/\s+/g, " ").trim();
  let answer: EmbeddedAnswer;

  if (isIndustrialLoggerQuestion(normalized)) {
    answer = industrialLoggerAnswer(question);
  } else if (isEvQuestion(normalized)) {
    answer = evCircuitsAnswer(question);
  } else if (isEmbeddedEcosystemQuestion(normalized)) {
    answer = embeddedEcosystemAnswer(question);
  } else if (hasEsp32StartIntent(normalized)) {
    answer = esp32StarterAnswer();
  } else if (
    mentionsEsp32(normalized) &&
    includesAny(normalized, [
      "disconnect",
      "unstable",
      "keeps dropping",
      "slow",
      "rssi",
      "wifi problem",
      "wi-fi problem",
    ])
  ) {
    answer = esp32WifiAnswer();
  } else if (isInternetConnectivityQuestion(normalized)) {
    answer = internetConnectivityAnswer(question);
  } else if (isArduinoBoardQuestion(normalized)) {
    answer = arduinoBoardAnswer(question);
  } else if (mentionsRaspberryPiSbc(normalized)) {
    answer = raspberryPiSbcAnswer(question);
  } else if (includesAny(normalized, ["stm32", "cube", "hal"])) {
    answer = stm32Answer(question);
  } else if (includesAny(normalized, ["pico", "rp2040", "rp2350"])) {
    answer = picoAnswer(question);
  } else if (
    includesAny(normalized, [
      "freertos",
      "rtos",
      "semaphore",
      "queue",
      "mutex",
      "task",
    ])
  ) {
    answer = freertosAnswer(question);
  } else if (includesAny(normalized, ["ads1115", "adc"])) {
    answer = ads1115Answer();
  } else if (includesAny(normalized, ["bme280", "bmp280"])) {
    answer = bme280Answer();
  } else if (isBasicCircuitQuestion(normalized)) {
    answer = basicCircuitAnswer(question);
  } else if (isCommunicationQuestion(normalized)) {
    answer = communicationProtocolAnswer(question);
  } else if (isCommonSensorQuestion(normalized)) {
    answer = commonSensorAnswer(question);
  } else if (
    includesAny(normalized, [
      "i2c",
      "spi",
      "uart",
      "gpio",
      "pwm",
      "interrupt",
      "sensor",
      "relay",
      "motor",
    ])
  ) {
    answer = practicalEmbeddedAnswer(question);
  } else if (isMachineLearningQuestion(normalized)) {
    answer = machineLearningAnswer(question);
  } else {
    answer = generalAnswer(question);
  }

  return applyAnswerAudit(
    question,
    applyQualityGate(
      question,
      applyPrecisionReview(
        question,
        applyAdaptiveContext(
          question,
          enrichWithKnowledge(question, answer),
          adaptiveContext
        )
      )
    )
  );
}

function unique(items: string[]) {
  return items.filter(
    (item, index, list) => item && list.indexOf(item) === index
  );
}

function detectBoards(question: string) {
  const normalized = question.toLowerCase();
  return unique([
    mentionsEsp32(normalized) ? "ESP32" : "",
    mentionsArduino(normalized) ? "Arduino family" : "",
    mentionsRaspberryPiSbc(normalized) ? "Raspberry Pi SBC" : "",
    includesAny(normalized, ["pico", "rp2040", "rp2350"])
      ? "Raspberry Pi Pico/RP2040"
      : "",
    includesAny(normalized, ["stm32", "cube", "hal"]) ? "STM32" : "",
  ]);
}

function detectProtocols(question: string) {
  const normalized = question.toLowerCase();
  return unique([
    includesAny(normalized, ["i2c", "wire"]) ? "I2C" : "",
    includesAny(normalized, ["spi"]) ? "SPI" : "",
    includesAny(normalized, ["uart", "serial", "usart"]) ? "UART/Serial" : "",
    includesAny(normalized, ["can bus", " can "]) ? "CAN" : "",
    includesAny(normalized, ["rs485", "modbus"]) ? "RS485/Modbus" : "",
    includesAny(normalized, ["wifi", "wi-fi"]) ? "Wi-Fi" : "",
    includesAny(normalized, ["ethernet", "lwip"]) ? "Ethernet/LwIP" : "",
    includesAny(normalized, ["mqtt"]) ? "MQTT" : "",
    includesAny(normalized, ["http", "https", "api"]) ? "HTTP/API" : "",
  ]);
}

function detectDomains(question: string) {
  const normalized = question.toLowerCase();
  return unique([
    isEvQuestion(normalized) ? "EV/high-voltage modules" : "",
    isInternetConnectivityQuestion(normalized)
      ? "Internet/IoT connectivity"
      : "",
    includesAny(normalized, ["stm32", "cube", "hal"]) ? "STM32 firmware" : "",
    mentionsArduino(normalized) ? "Arduino boards" : "",
    mentionsRaspberryPiSbc(normalized) ? "Raspberry Pi GPIO/Linux" : "",
    mentionsEsp32(normalized) ? "ESP32" : "",
    includesAny(normalized, ["sensor", "sensors", "dht", "bme", "ads1115"])
      ? "Sensors and measurement"
      : "",
    isCommunicationQuestion(normalized) ? "Communication buses" : "",
    isBasicCircuitQuestion(normalized) ? "Basic circuits" : "",
    includesAny(normalized, ["freertos", "rtos"]) ? "RTOS" : "",
    isMachineLearningQuestion(normalized) ? "Embedded ML" : "",
  ]);
}

function applyAnswerAudit(
  question: string,
  answer: EmbeddedAnswer
): EmbeddedAnswer {
  const normalized = ` ${question.toLowerCase()} `;
  const domains = detectDomains(question);
  const boards = detectBoards(question);
  const protocols = detectProtocols(question);
  const precision = answer.response.precision;
  const missingDetails = precision?.missingDetails ?? [];
  const highVoltage = includesAny(normalized, [
    " high voltage ",
    " mains ",
    " 220v ",
    " 110v ",
    " ev ",
    " bms ",
    " battery pack ",
  ]);
  const highRisk = includesAny(normalized, [
    " motor ",
    " relay ",
    " lithium ",
    " industrial ",
    " production ",
    " charger ",
  ]);
  const riskLevel: AnswerAudit["riskLevel"] = highVoltage
    ? "Critical"
    : highRisk || precision?.level.includes("Level 16")
      ? "High"
      : isInternetConnectivityQuestion(normalized) ||
          includesAny(normalized, ["0-10v", "0 to 10v"])
        ? "Medium"
        : "Low";
  const difficultyValue =
    riskLevel === "Critical"
      ? 16
      : riskLevel === "High"
        ? 14
        : domains.some(domain =>
              [
                "STM32 firmware",
                "Internet/IoT connectivity",
                "RTOS",
                "Embedded ML",
              ].includes(domain)
            )
          ? 12
          : domains.some(domain =>
                ["Sensors and measurement", "Communication buses"].includes(
                  domain
                )
              )
            ? 9
            : hasEsp32StartIntent(normalized)
              ? 4
              : 7;
  const rawCoverage =
    50 +
    Math.min(answer.response.references.length, 6) * 6 +
    Math.min(answer.response.codeBlocks.length, 3) * 6 +
    Math.min(answer.response.pinMapping.length, 6) * 3 -
    missingDetails.length * 7 -
    (riskLevel === "Critical" ? 15 : riskLevel === "High" ? 8 : 0);
  const coverageScore = Math.max(35, Math.min(96, rawCoverage));
  const openQuestions = unique([
    ...missingDetails,
    boards.length === 0
      ? "Exact board or controller family is not specified."
      : "",
    !includesAny(normalized, [
      "3.3v",
      "5v",
      "12v",
      "24v",
      "48v",
      "400v",
      "800v",
    ])
      ? "Exact voltage levels are not specified."
      : "",
    answer.response.references.length === 0
      ? "No exact official source matched this question."
      : "",
  ]).slice(0, 8);
  const improvementActions = unique([
    "Name the exact board/module revision before final wiring.",
    "Verify voltage levels and current limits with a meter before connecting signal pins.",
    "Compile or run the smallest example before combining features.",
    answer.response.references.length > 0
      ? "Open the linked official references and confirm pin names against your exact board."
      : "Add exact part numbers so the app can ground the answer in official references.",
    riskLevel === "Critical" || riskLevel === "High"
      ? "Use qualified review and controlled bench testing before real hardware deployment."
      : "",
  ]).slice(0, 8);

  return {
    response: {
      ...answer.response,
      answerAudit: {
        detectedDomains:
          domains.length > 0 ? domains : ["General embedded planning"],
        detectedBoards: boards,
        detectedProtocols: protocols,
        riskLevel,
        difficulty: `Level ${difficultyValue} / 16`,
        coverageScore,
        openQuestions,
        improvementActions,
      },
    },
  };
}

function enrichWithKnowledge(question: string, answer: EmbeddedAnswer) {
  const entries = findRelevantKnowledge(question, 4);
  if (entries.length === 0) return answer;

  const references = [...answer.response.references];
  for (const reference of referencesFromKnowledge(entries)) {
    if (!references.some(existing => existing.url === reference.url)) {
      references.push(reference);
    }
  }

  const debugChecklist = [...answer.response.debugChecklist];
  for (const check of checksFromKnowledge(entries)) {
    if (!debugChecklist.includes(check)) {
      debugChecklist.push(check);
    }
  }

  const facts = factsFromKnowledge(entries);
  const sourceNotes =
    facts.length > 0
      ? `\n\nSource-grounded notes:\n- ${facts.slice(0, 4).join("\n- ")}`
      : "";

  return {
    response: {
      ...answer.response,
      prose: answer.response.prose.includes("Source-grounded notes:")
        ? answer.response.prose
        : `${answer.response.prose}${sourceNotes}`,
      references: references.slice(0, 8),
      debugChecklist: debugChecklist.slice(0, 12),
    },
  };
}

function applyAdaptiveContext(
  question: string,
  answer: EmbeddedAnswer,
  adaptiveContext?: string
): EmbeddedAnswer {
  const context = adaptiveContext?.trim();
  if (!context) return answer;

  const appliedHints = context
    .split("\n")
    .map(line => line.replace(/^[-\s]+/, "").trim())
    .filter(line => line && !line.toLowerCase().startsWith("adaptive memory"))
    .slice(0, 6);

  if (appliedHints.length === 0) return answer;

  const adaptiveNotes = `\n\nAdaptive learning applied:\n- ${appliedHints.join("\n- ")}\n\nI used these remembered local task notes as hints, but I still keep datasheet checks and bench verification above memory when safety or precision matters.`;

  return {
    response: {
      ...answer.response,
      prose: answer.response.prose.includes("Adaptive learning applied:")
        ? answer.response.prose
        : `${answer.response.prose}${adaptiveNotes}`,
      debugChecklist: [
        ...answer.response.debugChecklist,
        "Check adaptive memory against the current datasheet or board variant before treating it as final.",
      ].filter((item, index, list) => item && list.indexOf(item) === index),
      adaptiveLearning: {
        memoryUsed: true,
        appliedHints,
        confidenceTarget:
          question.length > 0
            ? "Uses local task memory as a precision hint, not as a replacement for datasheets."
            : "No current question supplied.",
      },
    },
  };
}

function applyPrecisionReview(question: string, answer: EmbeddedAnswer) {
  const normalized = question.toLowerCase();
  const evQuestion = isEvQuestion(normalized);
  const highRisk =
    includesAny(normalized, [
      "0-10v",
      "0 to 10v",
      "mains",
      "220v",
      "110v",
      "li-ion",
      "lithium",
      "battery charger",
      "relay",
      "motor",
      "industrial",
      "production",
    ]) || evQuestion;
  const mentionsAnalogInput = includesAny(normalized, [
    "adc",
    "ads1115",
    "analog",
    "0-10v",
    "0 to 10v",
  ]);
  const missingDetails = [
    !includesAny(normalized, [
      "arduino",
      "esp-idf",
      "idf",
      "micropython",
      "python",
      "gpiozero",
      "raspberry pi os",
    ])
      ? "Programming framework is not specified."
      : "",
    !includesAny(normalized, ["3.3v", "5v", "12v", "24v", "0-10v", "0 to 10v"])
      ? "Exact supply and signal voltage levels are not fully specified."
      : "",
    highRisk &&
    !includesAny(normalized, ["accuracy", "tolerance", "calibration"])
      ? "Required accuracy, tolerance, and calibration method are not specified."
      : "",
    highRisk && !includesAny(normalized, ["isolation", "isolated"])
      ? "Isolation requirement is not specified."
      : "",
    evQuestion &&
    !includesAny(normalized, [
      "cell count",
      "chemistry",
      "voltage",
      "48v",
      "400v",
      "800v",
    ])
      ? "EV pack voltage, cell count, and battery chemistry are not specified."
      : "",
    evQuestion &&
    !includesAny(normalized, ["standard", "iso", "qualified", "certified"])
      ? "Applicable safety standard or qualification target is not specified."
      : "",
  ].filter(Boolean);
  const safetyWarnings = [
    includesAny(normalized, ["0-10v", "0 to 10v"])
      ? "Do not connect a 0-10V signal directly to ESP32 ADC or ADS1115 input. Scale and protect it first."
      : "",
    normalized.includes("5v") && mentionsEsp32(normalized)
      ? "ESP32 GPIO is not 5V tolerant. Use level shifting when a 5V signal touches GPIO."
      : "",
    normalized.includes("5v") && mentionsRaspberryPiSbc(normalized)
      ? "Raspberry Pi GPIO is not 5V tolerant. Use level shifting before a 5V signal reaches GPIO."
      : "",
    mentionsEsp32(normalized)
      ? "Avoid GPIO6-GPIO11 on common ESP32 modules because they are normally used for onboard flash."
      : "",
    highRisk
      ? "Bench-test with current-limited power before connecting field wiring or industrial equipment."
      : "",
    evQuestion
      ? "Do not work on live EV high-voltage circuits. Use manufacturer procedures, approved PPE, lockout/tagout, and qualified supervision."
      : "",
    evQuestion
      ? "Use low-voltage trainer circuits for learning BMS, precharge, contactor, and inverter concepts."
      : "",
  ].filter(Boolean);
  const verificationSteps = [
    "Verify every voltage with a multimeter before connecting signal wires.",
    "Confirm common ground, unless the design intentionally uses isolation.",
    "Run the smallest possible firmware test before combining sensors, networking, and tasks.",
    mentionsAnalogInput
      ? "Calibrate analog readings with at least two known input points and record measured error."
      : "",
    includesAny(normalized, ["i2c", "ads1115", "bme280"])
      ? "Run an I2C scanner and confirm each expected address appears once."
      : "",
    includesAny(normalized, ["wifi", "wi-fi"])
      ? "Log Wi-Fi status, RSSI, reconnect reason, and upload result during a 30-minute soak test."
      : "",
    evQuestion
      ? "For EV concepts, validate only with a low-voltage isolated trainer before touching any real vehicle pack."
      : "",
  ].filter(Boolean);
  const calculationNotes = [
    includesAny(normalized, ["0-10v", "0 to 10v"])
      ? "For 0-10V into ADS1115 powered at 3.3V, a 22k/10k divider gives about 3.125V at 10V. Convert back with Vin = Vadc * 3.2."
      : "",
    mentionsAnalogInput
      ? "For ADS1115 GAIN_ONE, ideal LSB is 4.096V / 32768 = 125uV before external divider scaling."
      : "",
    evQuestion
      ? "For precharge concept checks, use tau = Rprecharge * Cdc_link and verify the DC-link reaches the safe closing threshold before the main contactor closes."
      : "",
  ].filter(Boolean);
  const validationGates = [
    "Requirements gate: record exact part numbers, supply range, signal range, environment, accuracy target, and isolation requirement.",
    "Schematic gate: review power tree, boot pins, reserved pins, I2C pull-ups, input protection, and connector pinout.",
    "Firmware gate: test each task independently before enabling combined FreeRTOS scheduling.",
    "Calibration gate: verify analog conversion at low, mid, and high known inputs.",
    "Soak gate: run at least one long test with Wi-Fi reconnects, sensor reads, logging, and watchdog enabled.",
    highRisk
      ? "Safety gate: do not release until field wiring, isolation, surge/ESD strategy, and applicable standards are reviewed by a qualified engineer."
      : "",
    evQuestion
      ? "EV gate: do not move from block diagram to hardware until HV isolation, creepage/clearance, contactor logic, precharge, fuse strategy, discharge path, and emergency shutdown are reviewed."
      : "",
  ].filter(Boolean);
  const riskControls = [
    mentionsAnalogInput
      ? "Use resistor scaling, input current limiting, and clamp/TVS protection before the ADC input."
      : "",
    includesAny(normalized, ["wifi", "wi-fi"])
      ? "Buffer samples locally so a Wi-Fi outage does not destroy measurements."
      : "",
    includesAny(normalized, ["freertos", "task", "queue", "mutex"])
      ? "Use queues or notifications for task communication and mutexes for shared I2C/SPI access."
      : "",
    highRisk
      ? "Document safe operating area, fault states, and recovery behavior before field deployment."
      : "",
    evQuestion
      ? "Keep EV guidance educational unless exact pack data, qualified components, safety standards, and review authority are provided."
      : "",
  ].filter(Boolean);
  const releaseCriteria = [
    "No unresolved missing hardware details remain.",
    "All measured voltages match expected values before MCU connection.",
    "All source-linked assumptions are checked against the exact datasheets used in the build.",
    "Error budget is documented and measured against the target accuracy.",
    "The device survives power-cycle, brownout, Wi-Fi-loss, sensor-missing, and upload-failure tests.",
    evQuestion
      ? "EV content remains at or above the 85% precision target only for concepts and block-level guidance; exact designs require datasheets, standards, and qualified review."
      : "",
  ].filter(Boolean);
  const errorBudgetNotes = [
    mentionsAnalogInput
      ? "Analog error must include divider resistor tolerance, ADS1115 gain/reference error, input leakage, noise, calibration residual, and temperature drift."
      : "",
    includesAny(normalized, ["temperature", "humidity", "pressure", "bme280"])
      ? "Environmental readings must include sensor accuracy, self-heating, placement, airflow, and enclosure effects."
      : "",
    includesAny(normalized, ["wifi", "wi-fi"])
      ? "Data integrity must include retry policy, timestamp accuracy, duplicate upload handling, and local buffering limits."
      : "",
    evQuestion
      ? "EV error budget must include sensor accuracy, isolation measurement limits, contactor timing, precharge tolerance, thermal sensor placement, current-sensor offset, and fault reaction time."
      : "",
  ].filter(Boolean);
  const precision: PrecisionReview = {
    level: highRisk
      ? "Level 16 formal validation mode"
      : "Level 12 guarded precision mode",
    confidence:
      highRisk || missingDetails.length > 1
        ? "Needs bench verification"
        : missingDetails.length === 1
          ? "Medium"
          : "High",
    assumptions: [
      "The answer assumes common development boards, not every possible module variant.",
      "Final production values must be checked against the exact module datasheet and bench measurements.",
      mentionsEsp32(normalized)
        ? "ESP32 examples assume 3.3V logic and a common ESP32 DevKit-style board."
        : "",
      mentionsRaspberryPiSbc(normalized)
        ? "Raspberry Pi examples assume a modern 40-pin Raspberry Pi single-board computer using BCM GPIO numbering."
        : "",
      mentionsArduino(normalized)
        ? "Arduino examples assume the exact board pinout will be checked before wiring because voltage and pins vary by model."
        : "",
    ].filter(Boolean),
    safetyWarnings,
    verificationSteps,
    missingDetails,
    calculationNotes,
    validationGates,
    riskControls,
    releaseCriteria,
    errorBudgetNotes,
  };

  return {
    response: {
      ...answer.response,
      precision,
      debugChecklist: [
        ...answer.response.debugChecklist,
        ...verificationSteps,
      ].filter((item, index, list) => item && list.indexOf(item) === index),
    },
  };
}

function applyQualityGate(question: string, answer: EmbeddedAnswer) {
  const normalized = question.toLowerCase();
  const precision = answer.response.precision;
  const officialSources = new Set([
    "Arduino",
    "Raspberry Pi",
    "Espressif",
    "STMicroelectronics",
    "Texas Instruments",
    "Bosch Sensortec",
    "FreeRTOS",
    "NHTSA",
    "Infineon",
    "NXP",
    "TensorFlow",
  ]);
  const officialReferenceCount = answer.response.references.filter(reference =>
    reference.source ? officialSources.has(reference.source) : false
  ).length;
  const isHighRisk =
    precision?.level.includes("Level 16") ||
    includesAny(normalized, [
      "ev",
      "high voltage",
      "mains",
      "industrial",
      "battery",
      "motor",
      "relay",
      "production",
    ]);
  const missingDetails = precision?.missingDetails ?? [];
  const targetAccuracy = isHighRisk
    ? "85%+ for concept and planning; exact implementation requires datasheets, standards, and bench validation."
    : officialReferenceCount > 0 && missingDetails.length === 0
      ? "90%+ practical precision for common dev-board use, assuming the named board/module matches."
      : "85%+ practical precision until exact board, voltage, module variant, and framework are known.";
  const sourceGrounding =
    officialReferenceCount > 0
      ? `Grounded by ${officialReferenceCount} official or vendor reference(s) in this answer.`
      : "No exact source match found; answer is guarded by general embedded engineering checks.";
  const knownLimits = [
    "Development-board variants can move pins, change voltage tolerance, or add onboard level shifting.",
    "Library APIs and board packages can change; compile the smallest example before using full project code.",
    "Adaptive memory is a user preference hint, not a datasheet or safety authority.",
    isHighRisk
      ? "High-risk or vehicle/industrial hardware must be reviewed by a qualified engineer before real deployment."
      : "",
  ].filter(Boolean);
  const requiredUserDetails =
    missingDetails.length > 0
      ? missingDetails
      : [
          "Exact board or module revision.",
          "Supply voltage and signal voltage.",
          "Programming framework and library versions.",
        ];
  const nextVerification = [
    ...(precision?.verificationSteps ?? []),
    ...answer.response.debugChecklist,
  ]
    .filter((item, index, list) => item && list.indexOf(item) === index)
    .slice(0, 6);

  return {
    response: {
      ...answer.response,
      qualityGate: {
        targetAccuracy,
        sourceGrounding,
        sharpnessMode: isHighRisk
          ? "Strict guarded mode"
          : officialReferenceCount > 0
            ? "Source-grounded mode"
            : "Fallback guarded mode",
        knownLimits,
        requiredUserDetails,
        nextVerification,
      },
    },
  };
}

function industrialLoggerAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `This is a Level 16 formal-validation ESP32 industrial data-logger design. Treat it as a system with five separate layers: protected analog input, environmental sensing, task scheduling, network upload, and field validation.\n\nFor the 0-10V signal, do not wire it directly into ESP32 or ADS1115. Use a resistor divider and input protection. A practical first-pass divider is 22k from signal to ADC node and 10k from ADC node to GND. That scales 10V down to about 3.125V, which stays below a 3.3V-powered ADS1115 input limit with margin. In firmware, multiply the measured ADC-node voltage by 3.2 to estimate the original field voltage.\n\nFormal architecture:\n1. Requirements document records exact module variants, environment, accuracy, isolation, and fault behavior.\n2. Sensor task reads ADS1115 and BME280 on I2C.\n3. Network task uploads buffered samples every 30 seconds.\n4. Logger task stores failed uploads or warning events.\n5. Watchdog/error task checks Wi-Fi, I2C health, queue age, stack margin, and task timing.\n6. Calibration routine records known low/mid/high points before deployment.\n7. Release gate requires schematic review, bench validation, soak test, and error-budget signoff.\n\nOriginal question: "${question}"`,
      codeBlocks: [
        {
          language: "cpp",
          description:
            "ESP32 Arduino system skeleton with ADS1115, BME280, and task separation",
          code: `#include <Wire.h>
#include <WiFi.h>
#include <Adafruit_ADS1X15.h>
#include <Adafruit_BME280.h>

Adafruit_ADS1115 ads;
Adafruit_BME280 bme;

const float dividerScale = 3.2; // 22k top, 10k bottom
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

struct Sample {
  float fieldVoltage;
  float temperatureC;
  float humidityPct;
  float pressureHpa;
};

QueueHandle_t sampleQueue;

void sensorTask(void*) {
  for (;;) {
    int16_t raw = ads.readADC_SingleEnded(0);
    float adcVoltage = raw * 4.096f / 32768.0f;

    Sample sample;
    sample.fieldVoltage = adcVoltage * dividerScale;
    sample.temperatureC = bme.readTemperature();
    sample.humidityPct = bme.readHumidity();
    sample.pressureHpa = bme.readPressure() / 100.0f;

    xQueueOverwrite(sampleQueue, &sample);
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

void networkTask(void*) {
  for (;;) {
    Sample sample;
    if (xQueuePeek(sampleQueue, &sample, pdMS_TO_TICKS(100)) == pdTRUE) {
      if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("Upload: %.3f V, %.2f C, %.1f %%, %.1f hPa\\n",
          sample.fieldVoltage,
          sample.temperatureC,
          sample.humidityPct,
          sample.pressureHpa);
      } else {
        Serial.println("Wi-Fi down; keep sample for retry/logging.");
      }
    }
    vTaskDelay(pdMS_TO_TICKS(30000));
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!ads.begin(0x48)) {
    Serial.println("ADS1115 missing at 0x48");
    while (true) delay(100);
  }
  ads.setGain(GAIN_ONE); // +/-4.096V full-scale range

  if (!bme.begin(0x76)) {
    Serial.println("BME280 missing at 0x76; try 0x77");
    while (true) delay(100);
  }

  WiFi.begin(ssid, password);
  sampleQueue = xQueueCreate(1, sizeof(Sample));

  xTaskCreatePinnedToCore(sensorTask, "sensor", 4096, nullptr, 2, nullptr, 1);
  xTaskCreatePinnedToCore(networkTask, "network", 4096, nullptr, 1, nullptr, 0);
}

void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}`,
        },
      ],
      pinMapping: [
        {
          pin: "ADS1115 VDD",
          function: "ADC power",
          direction: "Input",
          notes:
            "Connect to 3.3V, not 5V, for ESP32-compatible logic and input limit.",
        },
        {
          pin: "ADS1115 A0",
          function: "Scaled 0-10V input",
          direction: "Input",
          notes: "Use 22k/10k divider; 10V becomes about 3.125V.",
        },
        {
          pin: "ADS1115 SDA / BME280 SDA",
          function: "I2C data",
          direction: "Bidirectional",
          notes:
            "Connect to ESP32 GPIO21 with pull-up resistors if modules do not include them.",
        },
        {
          pin: "ADS1115 SCL / BME280 SCL",
          function: "I2C clock",
          direction: "Output",
          notes:
            "Connect to ESP32 GPIO22 with pull-up resistors if modules do not include them.",
        },
        {
          pin: "ESP32 GPIO6-GPIO11",
          function: "Reserved flash bus",
          direction: "Reserved",
          notes: "Do not use on common ESP32 modules.",
        },
      ],
      references: [
        {
          title: "ESP32 Hardware Design Guidelines",
          url: "https://documentation.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/index.html",
          source: "Espressif",
        },
        {
          title: "ADS1115 Product Page and Datasheet",
          url: "https://www.ti.com/product/ADS1115",
          source: "Texas Instruments",
        },
        {
          title: "BME280 Product Page and Datasheet",
          url: "https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/",
          source: "Bosch Sensortec",
        },
        {
          title: "FreeRTOS Kernel Documentation",
          url: "https://www.freertos.org/Documentation/",
          source: "FreeRTOS",
        },
      ],
      debugChecklist: [
        "Measure divider output: 10.000V input should produce about 3.125V at ADS1115 A0.",
        "Confirm ADS1115 appears at 0x48 and BME280 appears at 0x76 or 0x77.",
        "Record calibration at known 0V and 10V inputs.",
        "Run a 30-minute Wi-Fi upload soak test and log reconnect events.",
        "Check task stack high-water marks after the system runs under load.",
      ],
      circuitNotes:
        "For field/industrial wiring, add input protection such as a series resistor and clamp/TVS strategy sized for the real environment. If field ground may differ from ESP32 ground, consider an isolated analog front end.",
    },
  };
}

function esp32StarterAnswer(): EmbeddedAnswer {
  return {
    response: {
      prose:
        'Here is the simplest way to start coding an ESP32.\n\n1. Install Arduino IDE.\n2. In Arduino IDE, add ESP32 board support.\n3. Select a board like "ESP32 Dev Module".\n4. Connect the ESP32 with USB.\n5. Choose the correct COM port.\n6. Upload a small test program first.\n\nA good first test is blinking the built-in LED. On many ESP32 boards the built-in LED is on GPIO2, but some boards use a different pin. If GPIO2 does not blink, try checking your board label or use an external LED with a resistor.',
      codeBlocks: [
        {
          language: "cpp",
          description: "First ESP32 Arduino test: blink an LED",
          code: `const int ledPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
}`,
        },
        {
          language: "cpp",
          description: "First ESP32 serial monitor test",
          code: `void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println("ESP32 is running");
  delay(1000);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "USB",
          function: "Power and programming",
          direction: "Input",
          notes: "Use this to upload code from the computer.",
        },
        {
          pin: "GPIO2",
          function: "Common onboard LED pin",
          direction: "Output",
          notes: "Works on many ESP32 dev boards, but not all.",
        },
        {
          pin: "GND",
          function: "Ground",
          direction: "Power",
          notes:
            "Use this as the common reference when adding sensors or LEDs.",
        },
      ],
      references: [
        {
          title: "ESP32 Arduino Core",
          url: "https://github.com/espressif/arduino-esp32",
          source: "Espressif",
        },
        {
          title: "ESP32 Documentation",
          url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/",
          source: "Espressif",
        },
      ],
      debugChecklist: [
        "If upload fails, hold the BOOT button while the IDE says Connecting.",
        "Make sure the USB cable supports data, not only charging.",
        "Check that the correct COM port is selected.",
        "Set Serial Monitor speed to 115200.",
        "Do not use GPIO6 to GPIO11; they are connected to onboard flash memory.",
      ],
      circuitNotes:
        "For your first external LED test, connect GPIO2 to a 220 ohm resistor, then to the LED anode. Connect the LED cathode to GND.",
    },
  };
}

function ads1115Answer(): EmbeddedAnswer {
  return {
    response: {
      prose:
        "The ADS1115 is a 16-bit analog-to-digital converter. Use it when the ESP32 built-in ADC is not accurate enough or when you need a cleaner voltage reading.\n\nFor ESP32, connect it with I2C. The usual pins are GPIO21 for SDA and GPIO22 for SCL. Power the ADS1115 from 3.3V so the logic level matches the ESP32.",
      codeBlocks: [
        {
          language: "cpp",
          description: "Read ADS1115 channel A0 with ESP32 and Arduino",
          code: `#include <Wire.h>
#include <Adafruit_ADS1X15.h>

Adafruit_ADS1115 ads;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!ads.begin(0x48)) {
    Serial.println("ADS1115 not found. Check wiring.");
    while (true) delay(10);
  }

  ads.setGain(GAIN_ONE);
}

void loop() {
  int16_t raw = ads.readADC_SingleEnded(0);
  float volts = raw * 4.096 / 32768.0;

  Serial.print("Raw: ");
  Serial.print(raw);
  Serial.print(" Voltage: ");
  Serial.println(volts, 4);
  delay(1000);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "VDD",
          function: "Power",
          direction: "Input",
          notes: "Connect to ESP32 3.3V.",
        },
        {
          pin: "GND",
          function: "Ground",
          direction: "Power",
          notes: "Connect to ESP32 GND.",
        },
        {
          pin: "SDA",
          function: "I2C data",
          direction: "Bidirectional",
          notes: "Connect to ESP32 GPIO21.",
        },
        {
          pin: "SCL",
          function: "I2C clock",
          direction: "Input",
          notes: "Connect to ESP32 GPIO22.",
        },
        {
          pin: "ADDR",
          function: "I2C address select",
          direction: "Input",
          notes: "Connect to GND for address 0x48.",
        },
        {
          pin: "A0",
          function: "Analog input",
          direction: "Input",
          notes: "Connect the voltage signal here.",
        },
      ],
      references: [
        {
          title: "ADS1115 Datasheet",
          url: "https://www.ti.com/lit/ds/symlink/ads1115.pdf",
          source: "Texas Instruments",
        },
        {
          title: "Adafruit ADS1X15 Library",
          url: "https://github.com/adafruit/Adafruit_ADS1X15",
          source: "Adafruit",
        },
        {
          title: "ESP32 I2C Guide",
          url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/i2c.html",
          source: "Espressif",
        },
      ],
      debugChecklist: [
        "Run an I2C scanner and confirm address 0x48 appears.",
        "Keep input voltage inside the selected gain range.",
        "Use a common ground between ESP32 and the measured circuit.",
        "Add 4.7k pull-up resistors on SDA and SCL if your breakout board does not already have them.",
        "Add a 100nF capacitor near the ADS1115 VDD and GND pins.",
      ],
      circuitNotes:
        "Do not feed a voltage higher than VDD into ADS1115 analog inputs. If measuring a higher voltage, use a voltage divider first.",
    },
  };
}

function esp32WifiAnswer(): EmbeddedAnswer {
  return {
    response: {
      prose:
        "If ESP32 Wi-Fi is slow or disconnecting, check power first. Wi-Fi transmit current can jump suddenly, and weak USB ports or thin wires often cause resets.\n\nThe ESP32 only connects to 2.4GHz Wi-Fi, not 5GHz. Keep the board close to the router while testing, print the signal strength, and avoid using flash pins GPIO6 to GPIO11.",
      codeBlocks: [
        {
          language: "cpp",
          description: "ESP32 Wi-Fi connection test with signal strength",
          code: `#include <WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\\nWi-Fi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Signal strength: ");
  Serial.println(WiFi.RSSI());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi disconnected");
  }
  delay(2000);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "3V3",
          function: "Power",
          direction: "Input",
          notes: "Needs a stable supply during Wi-Fi bursts.",
        },
        {
          pin: "EN",
          function: "Reset enable",
          direction: "Input",
          notes: "Noise here can reset the board.",
        },
        {
          pin: "GPIO6-11",
          function: "Flash memory bus",
          direction: "Reserved",
          notes: "DO NOT USE on common ESP32 dev boards.",
        },
      ],
      references: [
        {
          title: "ESP32 Wi-Fi Guide",
          url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/wifi.html",
          source: "Espressif",
        },
      ],
      debugChecklist: [
        "Use a 2.4GHz network.",
        "Check the power supply; try a stronger USB cable or a powered USB port.",
        "Check WiFi.RSSI(); values near -30 dBm are strong, below -75 dBm are weak.",
        "Confirm the router is not blocking the device by MAC address.",
        "Avoid long jumper wires near the antenna area.",
      ],
    },
  };
}

function internetConnectivityAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For internet-connected embedded projects, use a layered plan: physical link, IP network, secure transport, application protocol, and recovery behavior.\n\n1. Physical link: ESP32 or Wi-Fi Arduino uses Wi-Fi, Arduino Ethernet uses a wired shield/board, Raspberry Pi uses Wi-Fi or Ethernet, and STM32 often uses Ethernet with an external PHY and LwIP.\n2. IP network: confirm DHCP, gateway, DNS, and time sync before debugging MQTT or HTTP.\n3. Secure transport: use HTTPS or MQTT over TLS for cloud traffic, and validate certificates.\n4. Application protocol: use HTTP/REST for simple request-response, MQTT for sensor telemetry and commands, WebSocket for live dashboards, and TCP/UDP only when you control both ends.\n5. Recovery: add reconnect backoff, watchdog handling, local buffering, duplicate-safe uploads, and clear logs.\n\nAccuracy target: this fallback aims for 85%+ practical correctness for normal IoT architecture. Exact code still depends on the board, network library, broker/server, TLS certificates, and cloud API.\n\nOriginal question: "${question}"`,
      codeBlocks: [
        {
          language: "cpp",
          description: "ESP32 Arduino HTTPS-style connectivity skeleton",
          code: `#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* url = "https://example.com/api/telemetry";

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.print("\\nIP: ");
  Serial.println(WiFi.localIP());
  Serial.print("RSSI: ");
  Serial.println(WiFi.RSSI());
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int status = http.POST("{\\"temperature\\":25.4}");
  Serial.print("HTTP status: ");
  Serial.println(status);
  http.end();

  delay(30000);
}`,
        },
        {
          language: "python",
          description: "Raspberry Pi Python HTTP upload with timeout",
          code: `import requests
import time

url = "https://example.com/api/telemetry"

while True:
    payload = {"temperature": 25.4}
    try:
        response = requests.post(url, json=payload, timeout=10)
        print("HTTP", response.status_code)
    except requests.RequestException as error:
        print("Upload failed:", error)
    time.sleep(30)`,
        },
      ],
      pinMapping: [
        {
          pin: "ESP32 antenna area",
          function: "Wi-Fi RF path",
          direction: "Wireless",
          notes: "Keep metal, wires, copper, and tall parts away from antenna.",
        },
        {
          pin: "Arduino UNO R4 WiFi",
          function: "Wi-Fi through WiFiS3 library",
          direction: "Network",
          notes: "Use the board-specific Wi-Fi library, not always WiFi.h.",
        },
        {
          pin: "Arduino Ethernet shield/board",
          function: "Wired network",
          direction: "Network",
          notes: "Check SPI chip select and DHCP before MQTT/HTTP.",
        },
        {
          pin: "STM32 RMII/MII pins",
          function: "Ethernet MAC to PHY",
          direction: "Bidirectional",
          notes:
            "Verify PHY address, reference clock, descriptor memory, and LwIP configuration.",
        },
        {
          pin: "Raspberry Pi Wi-Fi/Ethernet",
          function: "Linux network interface",
          direction: "Network",
          notes:
            "Check IP, gateway, DNS, and service access from the OS first.",
        },
      ],
      references: [
        {
          title: "ESP-IDF MQTT Documentation",
          url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/protocols/mqtt.html",
          source: "Espressif",
        },
        {
          title: "Arduino Wi-Fi Overview",
          url: "https://docs.arduino.cc/language-reference/en/functions/wifi/overview/",
          source: "Arduino",
        },
        {
          title: "ArduinoMqttClient",
          url: "https://docs.arduino.cc/libraries/arduinomqttclient/",
          source: "Arduino",
        },
        {
          title: "Raspberry Pi Networking Documentation",
          url: "https://www.raspberrypi.com/documentation/computers/configuration.html",
          source: "Raspberry Pi",
        },
        {
          title: "STM32Cube LwIP Overview",
          url: "https://dev.st.com/stm32cube-docs/mw-lwip/2.0.0/en/overview.html",
          source: "STMicroelectronics",
        },
      ],
      debugChecklist: [
        "Print IP address, gateway, DNS, RSSI/link status, and server response code.",
        "Ping the gateway or server before testing MQTT/HTTP payloads.",
        "Use TLS for cloud traffic and validate certificates in production.",
        "Add retry with backoff so a weak network does not freeze the firmware.",
        "Buffer important sensor data locally when the internet is down.",
        "Keep Wi-Fi passwords, API keys, and broker credentials out of GitHub.",
      ],
      circuitNotes:
        "Internet access is not only code. Power stability, antenna placement, Ethernet PHY wiring, TLS time sync, and error recovery decide whether it survives real-world use.",
    },
  };
}

function evCircuitsAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For EV circuits, I can explain the modules and safe learning path, but real high-voltage EV hardware is not a beginner breadboard project. Work on live EV packs only with formal training, approved PPE, lockout/tagout, manufacturer procedures, and qualified supervision.\n\nCore EV modules:\n1. Battery pack: series/parallel cells, temperature sensors, fuses, busbars, service disconnect, and crash/service safety paths.\n2. BMS: measures cell voltages, pack current, temperatures, isolation status, state of charge, state of health, balancing, and fault states.\n3. Battery junction box: main positive/negative contactors, precharge contactor/resistor, fuse or pyrofuse, current sensor, voltage sensing, and HV interlock loop.\n4. Precharge circuit: charges inverter DC-link capacitors through a resistor before closing the main contactor, reducing inrush current.\n5. Traction inverter: converts HV DC into controlled three-phase AC for the motor using power modules, isolated gate drivers, current sensing, thermal sensing, and protection.\n6. DC-DC converter: converts HV battery voltage down to the 12V or low-voltage auxiliary system.\n7. On-board charger: converts external AC input into controlled DC battery charging under BMS/vehicle supervision.\n8. Thermal system: coolant pumps, fans, valves, heaters, and sensors keep battery and power electronics inside allowed temperature ranges.\n\n85%+ precision target: this answer is suitable for module-level understanding and low-voltage trainer design. It is not enough for designing or repairing a real EV HV system without exact datasheets, cell chemistry, pack voltage, standards, and professional review.\n\nOriginal question: "${question}"`,
      codeBlocks: [
        {
          language: "cpp",
          description:
            "Low-voltage precharge logic trainer, not for real EV high voltage",
          code: `const int prechargeRelay = 2;
const int mainContactor = 3;
const int dcLinkSense = A0;

const float closeThreshold = 0.90; // close main at 90% of trainer supply

void setup() {
  pinMode(prechargeRelay, OUTPUT);
  pinMode(mainContactor, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(prechargeRelay, HIGH);

  int raw = analogRead(dcLinkSense);
  float fraction = raw / 1023.0;
  Serial.println(fraction, 3);

  if (fraction >= closeThreshold) {
    digitalWrite(mainContactor, HIGH);
  }

  delay(100);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "BMS cell taps",
          function: "Cell voltage measurement",
          direction: "Input",
          notes:
            "Use dedicated cell-monitor ICs and manufacturer wiring rules for real packs.",
        },
        {
          pin: "Pack current sensor",
          function: "Charge/discharge current measurement",
          direction: "Input",
          notes:
            "Hall or shunt sensing must match current range and isolation needs.",
        },
        {
          pin: "Precharge contactor + resistor",
          function: "Limit DC-link inrush current",
          direction: "Power path",
          notes:
            "Close before the main contactor; open or bypass only after verified precharge threshold.",
        },
        {
          pin: "Main positive/negative contactors",
          function: "Connect or isolate HV battery bus",
          direction: "Power path",
          notes:
            "Needs weld detection, fault logic, and emergency shutdown behavior.",
        },
        {
          pin: "Traction inverter phase outputs",
          function: "Three-phase motor drive",
          direction: "Power output",
          notes:
            "High-voltage, high-current switching stage. Study with low-voltage motor-driver trainers first.",
        },
      ],
      references: [
        {
          title: "Electric and Hybrid Vehicles: Battery, Charging and Safety",
          url: "https://www.nhtsa.gov/vehicle-safety/electric-and-hybrid-vehicles",
          source: "NHTSA",
        },
        {
          title: "Automotive Battery Management System for EVs",
          url: "https://www.st.com/en/applications/electro-mobility/automotive-battery-management-system-bms.html",
          source: "STMicroelectronics",
        },
        {
          title: "EV Traction Inverter",
          url: "https://www.infineon.com/cms/en/applications/automotive/electric-drive-train/traction-inverter/",
          source: "Infineon",
        },
        {
          title: "Electric Vehicle Traction Inverter",
          url: "https://www.nxp.com/applications/EV-POWER-INVERTER",
          source: "NXP",
        },
      ],
      debugChecklist: [
        "Do not touch or modify real EV high-voltage circuits without qualified training and approved safety procedure.",
        "For learning, build only a low-voltage isolated trainer for precharge and contactor sequencing.",
        "List cell chemistry, cell count, pack voltage range, current limit, and thermal limits before any BMS discussion.",
        "Check overvoltage, undervoltage, overcurrent, overtemperature, undertemperature, isolation fault, and communication-loss behavior.",
        "Verify precharge timeout, DC-link threshold, contactor weld detection, fuse strategy, and emergency shutdown path.",
        "Review all real EV circuits against applicable automotive safety standards and component datasheets.",
      ],
      circuitNotes:
        "The safe educational path is block diagrams, low-voltage trainer circuits, and datasheet reading. Real EV pack/inverter/OBC hardware crosses into life-safety engineering.",
    },
  };
}

function embeddedEcosystemAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `Yes, we can grow it far beyond ESP32. A next-level embedded assistant should answer across five practical areas: boards, pin mapping, sensors, communication buses, and beginner circuits.\n\nFor boards, it should understand Arduino UNO/Nano/Mega/MKR/Portenta/GIGA-style boards, Raspberry Pi 3/4/5/Zero single-board computers, Raspberry Pi Pico/RP2040/RP2350 boards, ESP32 boards, and STM32 boards. The answer should always ask or infer the exact board because "Arduino", "Raspberry Pi", and "ESP32" are families, not one fixed pinout.\n\nFor sensors, it should explain what the sensor measures, what voltage it uses, which protocol it needs, which library to install, how to wire it, and how to run a small first test before building the final project.\n\nFor communication, it should compare I2C, SPI, UART, OneWire, CAN, RS485, and MQTT in simple words and warn when a transceiver or level shifter is required.\n\nFor circuits, it should explain LED resistors, buttons with pull-ups, voltage dividers, MOSFET drivers, relay flyback diodes, decoupling capacitors, and safe power wiring.\n\nOriginal request: "${question}"`,
      codeBlocks: [
        {
          language: "cpp",
          description: "Universal Arduino first hardware test",
          code: `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("Board is alive");
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}`,
        },
        {
          language: "cpp",
          description: "Arduino I2C scanner for sensors and displays",
          code: `#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Serial.println("Scanning I2C bus...");
}

void loop() {
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found I2C device at 0x");
      Serial.println(address, HEX);
    }
  }
  delay(3000);
}`,
        },
        {
          language: "python",
          description: "Raspberry Pi GPIO Zero LED test",
          code: `from gpiozero import LED
from time import sleep

led = LED(17)  # BCM GPIO17, physical pin 11

while True:
    led.on()
    sleep(0.5)
    led.off()
    sleep(0.5)`,
        },
      ],
      pinMapping: [
        {
          pin: "Arduino UNO/Nano A4/A5",
          function: "I2C SDA/SCL",
          direction: "Bidirectional",
          notes: "Common default I2C pins on classic UNO-style boards.",
        },
        {
          pin: "Arduino Mega D20/D21",
          function: "I2C SDA/SCL",
          direction: "Bidirectional",
          notes: "Mega uses different I2C pins than UNO.",
        },
        {
          pin: "Raspberry Pi GPIO2/GPIO3",
          function: "I2C SDA/SCL",
          direction: "Bidirectional",
          notes: "Physical pins 3 and 5. Raspberry Pi GPIO is 3.3V only.",
        },
        {
          pin: "Raspberry Pi GPIO10/GPIO9/GPIO11",
          function: "SPI MOSI/MISO/SCLK",
          direction: "Bidirectional",
          notes: "Use chip-enable pins such as GPIO8 or GPIO7 for SPI0.",
        },
        {
          pin: "ESP32 GPIO21/GPIO22",
          function: "Common I2C SDA/SCL",
          direction: "Bidirectional",
          notes: "Common Arduino-core defaults for many ESP32 examples.",
        },
      ],
      references: [
        {
          title: "Arduino Documentation",
          url: "https://docs.arduino.cc/",
          source: "Arduino",
        },
        {
          title: "Arduino Hardware Documentation",
          url: "https://docs.arduino.cc/hardware/",
          source: "Arduino",
        },
        {
          title: "Arduino Wire Reference",
          url: "https://docs.arduino.cc/language-reference/en/functions/communication/wire/",
          source: "Arduino",
        },
        {
          title: "Raspberry Pi GPIO and 40-pin Header",
          url: "https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#gpio-and-the-40-pin-header",
          source: "Raspberry Pi",
        },
      ],
      debugChecklist: [
        "Identify the exact board model before trusting any pin mapping.",
        "Check whether each signal is 5V or 3.3V before connecting boards together.",
        "Run blink or serial print before adding sensors.",
        "Run an I2C scanner before debugging an I2C library.",
        "Test one sensor at a time before combining sensors, displays, motors, and network code.",
        "Use external drivers for motors, relays, solenoids, and high-current loads.",
      ],
      circuitNotes:
        "This broad mode should not pretend one pin map covers every board. It should give a family-level answer, then name exact board-specific pins and warnings.",
    },
  };
}

function arduinoBoardAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For Arduino boards, first identify the exact board: UNO R3, UNO R4, Nano, Nano Every, Mega 2560, MKR, Portenta, GIGA, or another model. The code style may look similar, but voltage level, processor, pin functions, memory, USB behavior, and communication pins can be different.\n\nBeginner rule: use the official board page for pin mapping, then test with Blink, Serial, and an I2C scanner before adding the final sensor code.\n\nCommon board guidance:\n1. UNO/Nano-style boards are best for beginner breadboard circuits.\n2. Mega 2560 is useful when you need many pins or multiple UART ports.\n3. UNO R4 WiFi adds a stronger 32-bit MCU, Wi-Fi support through an onboard ESP32 module, DAC on A0, and different serial behavior than UNO R3.\n4. MKR/Portenta/GIGA boards are more advanced and often use 3.3V logic, so check the exact page before wiring.\n\nOriginal question: "${question}"`,
      codeBlocks: [
        {
          language: "cpp",
          description: "Arduino board alive test",
          code: `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("Arduino is running");
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}`,
        },
        {
          language: "cpp",
          description:
            "Arduino I2C scanner for UNO, Nano, Mega, and many other boards",
          code: `#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();
}

void loop() {
  Serial.println("Scanning...");

  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    byte error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("I2C device found at 0x");
      Serial.println(address, HEX);
    }
  }

  delay(5000);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "UNO/Nano D13",
          function: "Built-in LED / SPI SCK",
          direction: "Output",
          notes: "Good first Blink test pin, but it is also SPI clock.",
        },
        {
          pin: "UNO/Nano A4",
          function: "I2C SDA",
          direction: "Bidirectional",
          notes: "Also available on the SDA header pin on many boards.",
        },
        {
          pin: "UNO/Nano A5",
          function: "I2C SCL",
          direction: "Output",
          notes: "Also available on the SCL header pin on many boards.",
        },
        {
          pin: "UNO/Nano D10-D13",
          function: "SPI CS/COPI/CIPO/SCK",
          direction: "Bidirectional",
          notes: "SPI is also available on the ICSP header on many boards.",
        },
        {
          pin: "Mega D20/D21",
          function: "I2C SDA/SCL",
          direction: "Bidirectional",
          notes: "Mega does not use A4/A5 as the main I2C pins.",
        },
        {
          pin: "Mega D50-D53",
          function: "SPI CIPO/COPI/SCK/CS",
          direction: "Bidirectional",
          notes: "Use these or the ICSP header for Mega SPI.",
        },
        {
          pin: "D0/D1",
          function: "UART RX/TX",
          direction: "Bidirectional",
          notes:
            "Avoid these for normal GPIO if you need serial upload/debug or Serial1 UART.",
        },
      ],
      references: [
        {
          title: "Arduino Hardware Documentation",
          url: "https://docs.arduino.cc/hardware/",
          source: "Arduino",
        },
        {
          title: "Arduino UNO R4 WiFi User Manual",
          url: "https://docs.arduino.cc/tutorials/uno-r4-wifi/cheat-sheet",
          source: "Arduino",
        },
        {
          title: "Arduino Wire Reference",
          url: "https://docs.arduino.cc/language-reference/en/functions/communication/wire/",
          source: "Arduino",
        },
        {
          title: "Arduino SPI Reference",
          url: "https://docs.arduino.cc/language-reference/en/functions/communication/SPI",
          source: "Arduino",
        },
      ],
      debugChecklist: [
        "Select the exact Arduino board and COM port in the IDE.",
        "Use a data USB cable, not a charge-only cable.",
        "Run Blink before wiring sensors.",
        "Check whether the board is 5V or 3.3V logic.",
        "Use level shifting when connecting 5V Arduino boards to 3.3V-only sensors or Raspberry Pi GPIO.",
        "Run an I2C scanner before assuming a sensor library is broken.",
      ],
      circuitNotes:
        "For a mixed Arduino/Raspberry Pi/ESP project, the voltage mismatch is often the biggest danger. UNO/Mega-style boards are commonly 5V; Raspberry Pi, Pico, ESP32, and many sensors are 3.3V.",
    },
  };
}

function raspberryPiSbcAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For Raspberry Pi boards such as Pi 3, Pi 4, Pi 5, and Zero, remember this important difference: they are small Linux computers, not simple microcontrollers like Arduino UNO. You usually write Python code, enable interfaces in Raspberry Pi OS, and use the 40-pin GPIO header for hardware.\n\nThe biggest safety rule is simple: Raspberry Pi GPIO is 3.3V only. Do not connect a 5V sensor output directly to a GPIO pin. For motors, relays, solenoids, and high-current devices, use a driver board, transistor/MOSFET circuit, H-bridge, or relay module that is safe for 3.3V control.\n\nOriginal question: "${question}"`,
      codeBlocks: [
        {
          language: "python",
          description: "Raspberry Pi LED blink using GPIO Zero",
          code: `from gpiozero import LED
from time import sleep

led = LED(17)  # BCM GPIO17, physical pin 11

while True:
    led.toggle()
    sleep(0.5)`,
        },
        {
          language: "python",
          description: "Raspberry Pi button input using GPIO Zero",
          code: `from gpiozero import Button
from signal import pause

button = Button(27, pull_up=True)  # BCM GPIO27, physical pin 13

button.when_pressed = lambda: print("Button pressed")
button.when_released = lambda: print("Button released")

pause()`,
        },
      ],
      pinMapping: [
        {
          pin: "Physical pin 1 / 17",
          function: "3.3V power",
          direction: "Power",
          notes:
            "Use for small 3.3V modules only; do not overload the Pi regulator.",
        },
        {
          pin: "Physical pin 2 / 4",
          function: "5V power",
          direction: "Power",
          notes: "Power rail only. Do not feed 5V into GPIO signal pins.",
        },
        {
          pin: "GPIO2 / GPIO3",
          function: "I2C SDA/SCL",
          direction: "Bidirectional",
          notes: "Physical pins 3 and 5. Often used for I2C sensors.",
        },
        {
          pin: "GPIO10 / GPIO9 / GPIO11",
          function: "SPI MOSI/MISO/SCLK",
          direction: "Bidirectional",
          notes: "Use CE0 GPIO8 or CE1 GPIO7 for SPI chip select.",
        },
        {
          pin: "GPIO14 / GPIO15",
          function: "UART TX/RX",
          direction: "Bidirectional",
          notes: "Physical pins 8 and 10. UART may need enabling first.",
        },
        {
          pin: "Any GPIO signal pin",
          function: "Digital input/output",
          direction: "Bidirectional",
          notes: "3.3V only; not 5V tolerant.",
        },
      ],
      references: [
        {
          title: "Raspberry Pi GPIO and 40-pin Header",
          url: "https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#gpio-and-the-40-pin-header",
          source: "Raspberry Pi",
        },
        {
          title: "Raspberry Pi Documentation",
          url: "https://www.raspberrypi.com/documentation/",
          source: "Raspberry Pi",
        },
      ],
      debugChecklist: [
        "Use BCM GPIO numbering in Python unless the library says otherwise.",
        "Run the pinout command on the Pi to view the board-specific header.",
        "Enable I2C, SPI, or UART before testing those interfaces.",
        "Check that every sensor output going into GPIO is 3.3V-safe.",
        "Use a common ground between the Pi and external modules.",
        "Use a driver circuit for motors, relays, and other high-current loads.",
      ],
      circuitNotes:
        "Raspberry Pi can control hardware, but it should not directly power heavy loads. Treat GPIO as a logic signal, not a power source.",
    },
  };
}

function commonSensorAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For sensors, the clean way is to identify five things before writing the final code: what the sensor measures, supply voltage, signal voltage, communication protocol, and required library.\n\nCommon examples:\n1. DHT11/DHT22: temperature and humidity, single data pin, slow readings, simple library.\n2. BME280/BMP280: temperature/pressure/humidity depending on model, usually I2C or SPI, better for weather projects.\n3. HC-SR04: ultrasonic distance, trigger and echo pins, echo may be 5V and needs level shifting for ESP32/Raspberry Pi/Pico.\n4. MPU6050/IMU: motion/acceleration/gyro, usually I2C.\n5. SSD1306 OLED: display, usually I2C, address often 0x3C.\n6. PIR/relay/servo/motor modules: check current and driver requirements before connecting.\n\nOriginal question: "${question}"`,
      codeBlocks: [
        {
          language: "cpp",
          description: "Arduino DHT11/DHT22 temperature and humidity test",
          code: `#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("DHT read failed");
  } else {
    Serial.print("Temp C: ");
    Serial.print(temperature);
    Serial.print(" Humidity %: ");
    Serial.println(humidity);
  }

  delay(2000);
}`,
        },
        {
          language: "cpp",
          description: "Arduino HC-SR04 ultrasonic distance test",
          code: `const int trigPin = 9;
const int echoPin = 10;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  float distanceCm = duration * 0.0343 / 2.0;

  Serial.print("Distance cm: ");
  Serial.println(distanceCm);
  delay(500);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "DHT VCC",
          function: "Sensor power",
          direction: "Input",
          notes: "Use the voltage required by the module, commonly 3.3V or 5V.",
        },
        {
          pin: "DHT DATA",
          function: "Temperature/humidity data",
          direction: "Bidirectional",
          notes:
            "Connect to a digital GPIO. Some bare sensors need a pull-up resistor.",
        },
        {
          pin: "HC-SR04 TRIG",
          function: "Trigger pulse",
          direction: "Output",
          notes: "MCU output pin sends a short pulse.",
        },
        {
          pin: "HC-SR04 ECHO",
          function: "Echo pulse",
          direction: "Input",
          notes:
            "Many modules output 5V; level-shift before ESP32, Pico, or Raspberry Pi GPIO.",
        },
        {
          pin: "I2C sensor SDA/SCL",
          function: "Shared I2C bus",
          direction: "Bidirectional",
          notes: "Run an I2C scanner to confirm the sensor address.",
        },
      ],
      references: [
        {
          title: "Arduino DHT Sensor Library",
          url: "https://docs.arduino.cc/libraries/dht-sensor-library/",
          source: "Arduino",
        },
        {
          title: "DHT Sensor Guide",
          url: "https://learn.adafruit.com/dht/using-a-dhtxx-sensor",
          source: "Adafruit",
        },
        {
          title: "Arduino Sensor Kit Library",
          url: "https://docs.arduino.cc/libraries/arduino_sensorkit/",
          source: "Arduino",
        },
        {
          title: "Basic Servo Control",
          url: "https://docs.arduino.cc/tutorials/generic/basic-servo-control/",
          source: "Arduino",
        },
      ],
      debugChecklist: [
        "Confirm sensor supply voltage and signal voltage.",
        "Install the correct library and run its smallest example.",
        "Use a common ground between board and sensor.",
        "For I2C sensors, run an I2C scanner and confirm the address.",
        "For analog sensors, measure output voltage before connecting an ADC pin.",
        "For motors, relays, and servos, use a separate suitable power supply and driver when needed.",
      ],
      circuitNotes:
        "A sensor module is not always just the sensor chip. Breakout boards may add regulators, pull-ups, level shifters, filters, or LEDs, so the exact module matters.",
    },
  };
}

function communicationProtocolAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `Choose the communication method by distance, speed, number of devices, and noise level.\n\nI2C is easiest for many short-distance sensors because it uses only SDA and SCL. SPI is faster and good for displays, ADCs, SD cards, and fast sensors, but it needs more wires and a chip-select per device. UART is simple point-to-point serial communication. OneWire is common for DS18B20 temperature sensors. CAN and RS485 are better for noisy or longer wiring, but they need transceiver hardware. MQTT is not a pin-level protocol; it is a network messaging pattern usually used over Wi-Fi or Ethernet.\n\nOriginal question: "${question}"`,
      codeBlocks: [
        {
          language: "cpp",
          description: "Arduino I2C scanner",
          code: `#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();
}

void loop() {
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("I2C device at 0x");
      Serial.println(address, HEX);
    }
  }
  delay(3000);
}`,
        },
        {
          language: "cpp",
          description: "Arduino UART echo test",
          code: `void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    Serial.write(c);
  }
}`,
        },
      ],
      pinMapping: [
        {
          pin: "I2C SDA/SCL",
          function: "Shared sensor/display bus",
          direction: "Bidirectional",
          notes: "Needs pull-ups and matching logic voltage.",
        },
        {
          pin: "SPI SCK/COPI/CIPO/CS",
          function: "Fast peripheral bus",
          direction: "Bidirectional",
          notes: "Each SPI device normally needs its own chip-select pin.",
        },
        {
          pin: "UART TX/RX",
          function: "Serial link",
          direction: "Bidirectional",
          notes: "Connect TX to RX and RX to TX; baud rates must match.",
        },
        {
          pin: "CAN TX/RX",
          function: "MCU-to-transceiver logic",
          direction: "Bidirectional",
          notes: "A CAN transceiver is required before CANH/CANL bus wiring.",
        },
        {
          pin: "RS485 TX/RX/DE/RE",
          function: "MCU-to-transceiver logic",
          direction: "Bidirectional",
          notes:
            "An RS485 transceiver is required before A/B differential wiring.",
        },
      ],
      references: [
        {
          title: "Arduino Wire Reference",
          url: "https://docs.arduino.cc/language-reference/en/functions/communication/wire/",
          source: "Arduino",
        },
        {
          title: "Arduino I2C Guide",
          url: "https://docs.arduino.cc/learn/communication/wire",
          source: "Arduino",
        },
        {
          title: "Arduino SPI Reference",
          url: "https://docs.arduino.cc/language-reference/en/functions/communication/SPI",
          source: "Arduino",
        },
        {
          title: "Raspberry Pi GPIO and 40-pin Header",
          url: "https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#gpio-and-the-40-pin-header",
          source: "Raspberry Pi",
        },
      ],
      debugChecklist: [
        "Check voltage level before connecting communication pins.",
        "For I2C, confirm address, pull-ups, SDA/SCL order, and bus speed.",
        "For SPI, confirm mode, clock speed, bit order, and chip-select behavior.",
        "For UART, cross TX/RX and match baud rate.",
        "For CAN or RS485, use the correct transceiver and bus termination.",
        "Use a logic analyzer when wires look correct but data is still wrong.",
      ],
      circuitNotes:
        "I2C, SPI, and UART are logic-level signals. CAN and RS485 are bus-level systems and normally need dedicated transceiver chips.",
    },
  };
}

function basicCircuitAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For basic circuits, think in this order: power, current limit, signal level, and protection.\n\nLED: always use a resistor. A safe starter value is often 220 ohm to 1k ohm, depending on supply voltage and LED current.\n\nButton: do not leave the input floating. Use INPUT_PULLUP in code or add an external pull-up/pull-down resistor.\n\nVoltage divider: use two resistors to scale a larger voltage down. Formula: Vout = Vin * Rbottom / (Rtop + Rbottom). Measure Vout before connecting it to a board.\n\nMOSFET/transistor: use this when the load needs more current than a GPIO pin can safely supply.\n\nRelay/coil/motor: add flyback protection, use a driver, and never power the coil or motor directly from a GPIO pin.\n\nOriginal question: "${question}"`,
      codeBlocks: [
        {
          language: "cpp",
          description: "Arduino button with internal pull-up controlling LED",
          code: `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  bool pressed = digitalRead(buttonPin) == LOW;
  digitalWrite(ledPin, pressed ? HIGH : LOW);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "GPIO -> resistor -> LED -> GND",
          function: "LED output",
          direction: "Output",
          notes: "Use a resistor to limit current.",
        },
        {
          pin: "GPIO -> button -> GND",
          function: "Button input with INPUT_PULLUP",
          direction: "Input",
          notes: "Pressed reads LOW, released reads HIGH.",
        },
        {
          pin: "Vin -> Rtop -> ADC node -> Rbottom -> GND",
          function: "Voltage divider",
          direction: "Input",
          notes: "ADC node must stay inside the board input voltage limit.",
        },
        {
          pin: "GPIO -> gate/base driver",
          function: "MOSFET/transistor load control",
          direction: "Output",
          notes:
            "Use a driver stage for motors, relays, solenoids, pumps, and LED strips.",
        },
      ],
      references: [
        {
          title: "Arduino Blink Example",
          url: "https://docs.arduino.cc/built-in-examples/basics/Blink",
          source: "Arduino",
        },
        {
          title: "Arduino Button Example",
          url: "https://docs.arduino.cc/built-in-examples/digital/Button/",
          source: "Arduino",
        },
        {
          title: "Arduino Analog Input Example",
          url: "https://docs.arduino.cc/built-in-examples/analog/AnalogInput/",
          source: "Arduino",
        },
      ],
      debugChecklist: [
        "Measure supply voltage before wiring the board.",
        "Calculate LED resistor value: R = (Vsupply - Vled) / current.",
        "Use INPUT_PULLUP or an external resistor for buttons.",
        "Measure voltage divider output before connecting the ADC.",
        "Add a flyback diode across relay coils and similar inductive loads.",
        "Use a separate power supply when a load current is larger than the board can provide.",
      ],
      circuitNotes:
        "Most beginner circuit failures come from missing current limiting, floating inputs, no common ground, or feeding a GPIO pin with the wrong voltage.",
    },
  };
}

function bme280Answer(): EmbeddedAnswer {
  return {
    response: {
      prose:
        "The BME280 is a temperature, humidity, and pressure sensor. The easiest ESP32 connection is I2C: SDA to GPIO21, SCL to GPIO22, power to 3.3V, and ground to ground.\n\nMost BME280 breakout boards use address 0x76 or 0x77. If your code cannot find the sensor, the address is the first thing to check.",
      codeBlocks: [
        {
          language: "cpp",
          description: "Read BME280 with ESP32 and Arduino",
          code: `#include <Wire.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!bme.begin(0x76)) {
    Serial.println("BME280 not found. Try address 0x77.");
    while (true) delay(10);
  }
}

void loop() {
  Serial.print("Temperature: ");
  Serial.print(bme.readTemperature());
  Serial.println(" C");

  Serial.print("Humidity: ");
  Serial.print(bme.readHumidity());
  Serial.println(" %");

  Serial.print("Pressure: ");
  Serial.print(bme.readPressure() / 100.0F);
  Serial.println(" hPa");
  delay(2000);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "VIN/VCC",
          function: "Power",
          direction: "Input",
          notes: "Use 3.3V unless your breakout board says 5V-safe.",
        },
        {
          pin: "GND",
          function: "Ground",
          direction: "Power",
          notes: "Connect to ESP32 GND.",
        },
        {
          pin: "SDA",
          function: "I2C data",
          direction: "Bidirectional",
          notes: "Connect to ESP32 GPIO21.",
        },
        {
          pin: "SCL",
          function: "I2C clock",
          direction: "Input",
          notes: "Connect to ESP32 GPIO22.",
        },
      ],
      references: [
        {
          title: "BME280 Datasheet",
          url: "https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/",
          source: "Bosch Sensortec",
        },
        {
          title: "Adafruit BME280 Library",
          url: "https://github.com/adafruit/Adafruit_BME280_Library",
          source: "Adafruit",
        },
      ],
      debugChecklist: [
        "Try both I2C addresses: 0x76 and 0x77.",
        "Run an I2C scanner before debugging the sensor library.",
        "Use 3.3V logic with ESP32.",
        "Keep wires short if readings are unstable.",
      ],
    },
  };
}

function stm32Answer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For this STM32 question: "${question}"\n\nUse this order: exact part number, clock tree, GPIO mode, alternate function, peripheral initialization, explicit start/read/write call, then interrupt or DMA only after polling works.\n\nSTM32 is a large family, so a pin or peripheral answer is only accurate after the exact MCU package is known. GPIO can be input, output, analog, or alternate function. ADC needs analog-mode pins and sampling-time choices. PWM needs a timer channel and a started timer output. UART/I2C/SPI need alternate-function pins. Ethernet usually needs MAC + external PHY + RMII/MII pins + LwIP + correct descriptor memory.\n\nA practical 85%+ answer should name the HAL layer, the peripheral, the expected pins, the clock source, and the verification method. For production, check the exact datasheet, reference manual, errata, Cube example, and board schematic.`,
      codeBlocks: [
        {
          language: "c",
          description: "STM32 HAL-style GPIO output pattern",
          code: `// Generated projects usually provide MX_GPIO_Init().
// This is the basic pattern to check when debugging.

__HAL_RCC_GPIOA_CLK_ENABLE();

GPIO_InitTypeDef GPIO_InitStruct = {0};
GPIO_InitStruct.Pin = GPIO_PIN_5;
GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
GPIO_InitStruct.Pull = GPIO_NOPULL;
GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET);`,
        },
        {
          language: "c",
          description:
            "STM32 HAL polling-first pattern before interrupt or DMA",
          code: `// Pattern only: handles are normally generated by CubeMX/CubeIDE.
extern UART_HandleTypeDef huart2;
extern ADC_HandleTypeDef hadc1;

void app_test_peripherals(void) {
  const uint8_t msg[] = "STM32 alive\\r\\n";
  HAL_UART_Transmit(&huart2, (uint8_t*)msg, sizeof(msg) - 1, 100);

  HAL_ADC_Start(&hadc1);
  if (HAL_ADC_PollForConversion(&hadc1, 100) == HAL_OK) {
    uint32_t raw = HAL_ADC_GetValue(&hadc1);
    (void)raw;
  }
  HAL_ADC_Stop(&hadc1);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "GPIOx",
          function: "Digital input/output",
          direction: "Input or output",
          notes:
            "Enable GPIO port clock and choose pull-up, pull-down, speed, and output type.",
        },
        {
          pin: "ADCx_INy",
          function: "ADC input",
          direction: "Input",
          notes: "Pin must be ADC-capable and configured as analog mode.",
        },
        {
          pin: "TIMx_CHy",
          function: "PWM output",
          direction: "Output",
          notes:
            "Requires timer base, channel config, and HAL_TIM_PWM_Start().",
        },
        {
          pin: "SCL/SDA",
          function: "I2C pins",
          direction: "Open-drain",
          notes:
            "Use the alternate function for the selected I2C peripheral and add pull-up resistors.",
        },
        {
          pin: "SCK/MOSI/MISO",
          function: "SPI pins",
          direction: "Push-pull",
          notes: "Check SPI mode, clock speed, and chip-select timing.",
        },
        {
          pin: "TX/RX",
          function: "UART/USART pins",
          direction: "Bidirectional",
          notes: "Select the correct alternate function and match baud rate.",
        },
        {
          pin: "RMII/MII pins",
          function: "Ethernet MAC to PHY",
          direction: "Bidirectional",
          notes:
            "Check PHY address, reference clock, descriptor memory, cache/MPU, and LwIP setup.",
        },
        {
          pin: "SWDIO/SWCLK",
          function: "Debug programming",
          direction: "Debug",
          notes:
            "Do not reuse these until you are sure you can still program the board.",
        },
      ],
      references: [
        {
          title: "STM32Cube HAL GPIO Guide",
          url: "https://dev.st.com/stm32cube-docs/stm32c5xx-hal-drivers/2.0.0/en/docs/drivers/hal_drivers/gpio/hal_gpio_how_to_use.html",
          source: "STMicroelectronics",
        },
        {
          title: "STM32Cube HAL I2C Guide",
          url: "https://dev.st.com/stm32cube-docs/stm32c5xx-hal-drivers/2.0.0/en/docs/drivers/hal_drivers/i2c/hal_i2c_how_to_use.html",
          source: "STMicroelectronics",
        },
        {
          title: "STM32Cube LwIP TCP/IP Stack",
          url: "https://dev.st.com/stm32cube-docs/mw-lwip/2.0.0/en/overview.html",
          source: "STMicroelectronics",
        },
      ],
      debugChecklist: [
        "Check the exact STM32 part number and package pinout.",
        "Enable the GPIO and peripheral clocks, and verify the system clock tree.",
        "Verify alternate function selection for the selected pin.",
        "Start with polling before adding interrupts or DMA.",
        "For ADC, verify analog mode, sampling time, reference voltage, and calibration needs.",
        "For PWM, verify timer clock, prescaler, period, duty cycle, and HAL_TIM_PWM_Start().",
        "For Ethernet/LwIP, test link, DHCP, ping, then TCP/UDP before adding HTTP or MQTT.",
      ],
    },
  };
}

function picoAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For this Raspberry Pi Pico question: "${question}"\n\nFirst choose whether you are using MicroPython, Arduino, or the Pico C/C++ SDK. Then confirm the GPIO supports the function you want. Pico pins are multifunction, so one physical pin may support UART, I2C, SPI, PWM, or plain GPIO depending on configuration.\n\nFor analog input, use ADC-capable GPIO only. For sensors, I2C is usually the easiest first protocol to test.`,
      codeBlocks: [
        {
          language: "python",
          description: "MicroPython Pico LED blink test",
          code: `from machine import Pin
from time import sleep

led = Pin(25, Pin.OUT)

while True:
    led.toggle()
    sleep(0.5)`,
        },
      ],
      pinMapping: [
        {
          pin: "GP25",
          function: "Onboard LED on many Pico boards",
          direction: "Output",
          notes: "Useful for first firmware tests.",
        },
        {
          pin: "GP26-GP28",
          function: "ADC-capable GPIO on Pico family boards",
          direction: "Input",
          notes: "Use these for simple analog input on many Pico boards.",
        },
        {
          pin: "3V3",
          function: "3.3V supply",
          direction: "Power",
          notes: "Use 3.3V logic for GPIO.",
        },
      ],
      references: [
        {
          title: "Raspberry Pi Pico SDK Hardware APIs",
          url: "https://www.raspberrypi.com/documentation/pico-sdk/hardware.html",
          source: "Raspberry Pi",
        },
      ],
      debugChecklist: [
        "Confirm your board is Pico, Pico W, Pico 2, or another RP2040/RP2350 board.",
        "Check that the chosen GPIO supports the desired peripheral.",
        "Use 3.3V logic, not 5V logic, on GPIO.",
        "Start with a blink or serial print test.",
      ],
    },
  };
}

function freertosAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For this FreeRTOS question: "${question}"\n\nThink in terms of tasks and communication. A task should do one job, then block or delay so other tasks can run. Use queues to pass data, mutexes to protect shared resources, semaphores for events, and direct-to-task notifications when one task needs a lightweight signal.\n\nMost FreeRTOS bugs are caused by blocking forever, stack overflow, priority mistakes, or shared data being changed by two tasks at the same time.`,
      codeBlocks: [
        {
          language: "c",
          description: "FreeRTOS task skeleton",
          code: `void SensorTask(void *pvParameters) {
  for (;;) {
    // Read sensor here
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

void app_main(void) {
  xTaskCreate(SensorTask, "sensor", 2048, NULL, 5, NULL);
}`,
        },
      ],
      pinMapping: [],
      references: [
        {
          title: "FreeRTOS Semaphores and Mutexes",
          url: "https://www.freertos.org/Documentation/02-Kernel/04-API-references/10-Semaphore-and-Mutexes/00-Semaphores",
          source: "FreeRTOS",
        },
      ],
      debugChecklist: [
        "Check stack high-water marks.",
        "Avoid long blocking calls in high-priority tasks.",
        "Use queues or notifications instead of shared global variables when possible.",
        "Protect shared peripherals such as I2C or SPI with a mutex.",
      ],
    },
  };
}

function practicalEmbeddedAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For this question: "${question}"\n\nStart by separating the problem into four simple parts: power, pins, protocol, and code.\n\nPower means voltage and current. Pins means which GPIOs are safe to use. Protocol means I2C, SPI, UART, PWM, or plain digital input/output. Code means a small test program that checks one thing at a time.\n\nA practical debugging habit is: first make the board print to Serial Monitor, then test the hardware connection, then add the final logic.`,
      codeBlocks: [
        {
          language: "cpp",
          description: "Small ESP32 test skeleton",
          code: `void setup() {
  Serial.begin(115200);
  Serial.println("Board started");
}

void loop() {
  Serial.println("Test one hardware feature here");
  delay(1000);
}`,
        },
      ],
      pinMapping: [
        {
          pin: "3V3",
          function: "Power",
          direction: "Output",
          notes: "Use for 3.3V sensors only.",
        },
        {
          pin: "GND",
          function: "Ground",
          direction: "Power",
          notes: "All modules need a common ground.",
        },
        {
          pin: "GPIO21",
          function: "I2C SDA",
          direction: "Bidirectional",
          notes: "Common ESP32 I2C data pin.",
        },
        {
          pin: "GPIO22",
          function: "I2C SCL",
          direction: "Output",
          notes: "Common ESP32 I2C clock pin.",
        },
      ],
      references: [
        {
          title: "ESP32 Documentation",
          url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/",
          source: "Espressif",
        },
      ],
      debugChecklist: [
        "Check voltage before connecting the signal wire.",
        "Confirm the board and module share GND.",
        "Test with the smallest possible code first.",
        "Avoid ESP32 flash pins GPIO6 to GPIO11.",
        "If using I2C, run an I2C scanner.",
      ],
    },
  };
}

function machineLearningAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `For this question: "${question}"\n\nMachine learning means teaching a program to find patterns from examples instead of writing every rule by hand. A simple workflow is: collect data, clean it, train a model, test it on unseen data, then use the model in an app or device.\n\nFor embedded projects, small models are usually better. A tiny model can classify sensor readings, detect simple sounds, or identify unusual machine behavior without needing a big server.`,
      codeBlocks: [
        {
          language: "python",
          description: "Tiny machine-learning example idea",
          code: `from sklearn.tree import DecisionTreeClassifier

# Example: [temperature, vibration]
X = [[25, 1], [80, 9], [27, 2], [90, 10]]
y = ["normal", "fault", "normal", "fault"]

model = DecisionTreeClassifier()
model.fit(X, y)

print(model.predict([[85, 8]]))`,
        },
      ],
      pinMapping: [],
      references: [
        {
          title: "TensorFlow Lite for Microcontrollers",
          url: "https://www.tensorflow.org/lite/microcontrollers",
          source: "TensorFlow",
        },
      ],
      debugChecklist: [
        "Start with a small dataset you understand.",
        "Keep separate training and testing data.",
        "Measure accuracy on examples the model has never seen.",
        "For microcontrollers, check RAM and flash size before choosing a model.",
      ],
    },
  };
}

function generalAnswer(question: string): EmbeddedAnswer {
  return {
    response: {
      prose: `Global fallback mode for: "${question}"\n\nI do not have enough exact hardware detail to give a board-specific answer, so I will give a safe practical framework instead. This is meant to be understandable and roughly 85%+ useful for normal embedded planning, but exact pin numbers, resistor values, firmware calls, and safety limits must come from the exact board/module datasheets.\n\nUse this checklist:\n1. Define the job in one sentence.\n2. Identify the board, module, sensor, voltage, current, protocol, and software framework.\n3. Test power first, then serial output, then one sensor or one circuit, then internet/cloud, then final logic.\n4. For any high voltage, battery, motor, relay, charger, or vehicle topic, stop and switch to a safety-reviewed design path.\n5. If the project connects to the internet, add TLS, retries, offline buffering, and logs before calling it reliable.`,
      codeBlocks: [
        {
          language: "text",
          description: "Universal embedded project question template",
          code: `Goal:
Board:
Sensor/module:
Supply voltage:
Signal voltage:
Protocol: GPIO / ADC / I2C / SPI / UART / CAN / RS485 / Wi-Fi / Ethernet
Software: Arduino / ESP-IDF / STM32 HAL / MicroPython / Python
Expected result:
What happened instead:
Exact error message:`,
        },
      ],
      pinMapping: [],
      references: [
        {
          title: "Arduino Documentation",
          url: "https://docs.arduino.cc/",
          source: "Arduino",
        },
        {
          title: "Raspberry Pi Documentation",
          url: "https://www.raspberrypi.com/documentation/",
          source: "Raspberry Pi",
        },
        {
          title: "ESP-IDF Programming Guide",
          url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/",
          source: "Espressif",
        },
        {
          title: "STM32Cube HAL GPIO Guide",
          url: "https://dev.st.com/stm32cube-docs/stm32c5xx-hal-drivers/2.0.0/en/docs/drivers/hal_drivers/gpio/hal_gpio_how_to_use.html",
          source: "STMicroelectronics",
        },
      ],
      debugChecklist: [
        "Write the exact goal in one sentence.",
        "List the board, module, supply voltage, signal voltage, and software framework.",
        "Verify power rails and common ground before connecting signal wires.",
        "Run the smallest firmware test before combining features.",
        "Share the exact error text if there is one.",
        "Check the exact datasheet before trusting any fallback pin or voltage assumption.",
      ],
      circuitNotes:
        "Fallback answers should guide the next safe test, not pretend every unknown board or module has the same wiring.",
    },
  };
}
