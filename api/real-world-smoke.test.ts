import { afterEach, describe, expect, it, vi } from "vitest";
import { chatRouter } from "./chat-router";

function createCaller() {
  return chatRouter.createCaller({
    req: new Request("http://localhost/api/trpc"),
    resHeaders: new Headers(),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("real-world examples explained in simple language", () => {
  it("when someone asks how to connect an ADS1115 sensor board to an ESP32, the app explains the wiring, code, datasheet links, and safety checks", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question: "How do I wire an ADS1115 ADC to an ESP32 and read voltage?",
    });

    expect(result.response.prose).toContain("ADS1115");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("ESP32"),
          language: "cpp",
        }),
      ])
    );
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pin: "VDD",
          notes: expect.stringContaining("3.3V"),
        }),
        expect.objectContaining({
          pin: "SDA",
          notes: expect.stringContaining("GPIO21"),
        }),
        expect.objectContaining({
          pin: "SCL",
          notes: expect.stringContaining("GPIO22"),
        }),
      ])
    );
    expect(result.response.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "Texas Instruments",
          url: expect.stringContaining("ads1115"),
        }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([expect.stringContaining("I2C")])
    );
  });

  it("when someone says their ESP32 Wi-Fi keeps disconnecting, the app gives simple things to check like power, 2.4GHz Wi-Fi, signal strength, and pins to avoid", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question: "My ESP32 WiFi keeps disconnecting. What should I check?",
    });

    expect(result.response.prose).toContain("ESP32");
    expect(result.response.prose).toContain("Wi-Fi");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("Wi-Fi"),
          language: "cpp",
        }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining("2.4GHz"),
        expect.stringContaining("power supply"),
      ])
    );
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pin: "GPIO6-11",
          notes: expect.stringContaining("DO NOT USE"),
        }),
      ])
    );
  });

  it("when someone asks about STM32 HAL setup, the app explains clocks, GPIO alternate functions, and official ST references", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "STM32 HAL I2C sensor is not working. What setup should I check?",
    });

    expect(result.response.prose).toContain("STM32");
    expect(result.response.prose).toContain("alternate function");
    expect(result.response.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "STMicroelectronics",
        }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Enable the GPIO and peripheral clocks"),
      ])
    );
  });

  it("when someone asks about FreeRTOS, the app gives task communication guidance instead of generic electronics text", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question: "How should I use queues and mutexes between FreeRTOS tasks?",
    });

    expect(result.response.prose).toContain("FreeRTOS");
    expect(result.response.prose).toContain("queues");
    expect(result.response.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "FreeRTOS",
        }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([expect.stringContaining("stack")])
    );
  });

  it("when someone asks about Raspberry Pi Pico pins, the app talks about multifunction GPIO and ADC-capable pins", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question: "Which Raspberry Pi Pico pins should I use for ADC and I2C?",
    });

    expect(result.response.prose).toContain("Pico");
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pin: "GP26-GP28",
        }),
      ])
    );
    expect(result.response.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "Raspberry Pi",
        }),
      ])
    );
  });

  it("handles a broad next-level embedded request across Arduino, Raspberry Pi, sensors, communication, and circuits", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "Add all kinds of R-Pi and Arduino boards, documentation, code, pins mapping, sensors, communications, and basic circuits understanding.",
    });

    expect(result.response.prose).toContain("far beyond ESP32");
    expect(result.response.prose).toContain("Arduino");
    expect(result.response.prose).toContain("Raspberry Pi");
    expect(result.response.prose).toContain("I2C, SPI, UART");
    expect(result.response.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "Arduino" }),
        expect.objectContaining({ source: "Raspberry Pi" }),
      ])
    );
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pin: "Raspberry Pi GPIO2/GPIO3",
          notes: expect.stringContaining("3.3V"),
        }),
      ])
    );
  });

  it("answers Arduino board pin-mapping questions with UNO, Mega, code, and official references", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "For Arduino UNO R4, UNO R3, Nano, and Mega 2560, explain pin mapping for I2C, SPI, UART and give starter code.",
    });

    expect(result.response.prose).toContain("Mega 2560");
    expect(result.response.prose).toContain("UNO R4");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("I2C scanner"),
          language: "cpp",
        }),
      ])
    );
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pin: "Mega D20/D21" }),
        expect.objectContaining({ pin: "Mega D50-D53" }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([expect.stringContaining("5V or 3.3V")])
    );
  });

  it("answers Raspberry Pi SBC GPIO questions with 40-pin mapping, Python code, and 3.3V warnings", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "Raspberry Pi 5 GPIO: how do I use I2C, SPI, UART and blink an LED in Python? Can I connect 5V sensors?",
    });

    expect(result.response.prose).toContain("3.3V only");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          language: "python",
          description: expect.stringContaining("LED blink"),
        }),
      ])
    );
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pin: "GPIO2 / GPIO3" }),
        expect.objectContaining({ pin: "GPIO10 / GPIO9 / GPIO11" }),
      ])
    );
    expect(result.response.precision?.safetyWarnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Raspberry Pi GPIO is not 5V tolerant"),
      ])
    );
  });

  it("answers common sensor questions with DHT22 and HC-SR04 code plus level-shifting checks", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "How do I connect DHT22 temperature humidity sensor and HC-SR04 ultrasonic sensor to Arduino or ESP32?",
    });

    expect(result.response.prose).toContain("DHT11/DHT22");
    expect(result.response.prose).toContain("HC-SR04");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("DHT11/DHT22"),
        }),
        expect.objectContaining({
          description: expect.stringContaining("HC-SR04"),
        }),
      ])
    );
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pin: "HC-SR04 ECHO",
          notes: expect.stringContaining("level-shift"),
        }),
      ])
    );
  });

  it("compares communication protocols with practical pin names and transceiver warnings", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "Compare I2C, SPI, UART, CAN bus, RS485, OneWire, and MQTT for embedded sensors.",
    });

    expect(result.response.prose).toContain("CAN and RS485");
    expect(result.response.prose).toContain("transceiver");
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pin: "I2C SDA/SCL" }),
        expect.objectContaining({ pin: "RS485 TX/RX/DE/RE" }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([expect.stringContaining("bus termination")])
    );
  });

  it("explains beginner circuits with formulas, button pull-ups, MOSFET drivers, and relay protection", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "Explain LED resistor, button pull-up, voltage divider, MOSFET motor driver, relay flyback diode, and safe breadboard basics.",
    });

    expect(result.response.prose).toContain(
      "Vout = Vin * Rbottom / (Rtop + Rbottom)"
    );
    expect(result.response.prose).toContain("flyback");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("internal pull-up"),
        }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining("R = (Vsupply - Vled) / current"),
      ])
    );
  });

  it("answers internet implementation questions with Wi-Fi, Ethernet, MQTT, HTTP, TLS, and offline reliability checks", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "Implement internet connection and access for ESP32, Arduino UNO R4 WiFi, Raspberry Pi, and STM32 Ethernet using WiFi, Ethernet, MQTT, HTTP, and TLS.",
    });

    expect(result.response.prose).toContain("85%+");
    expect(result.response.prose).toContain("MQTT");
    expect(result.response.prose).toContain("TLS");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("HTTPS"),
        }),
        expect.objectContaining({
          language: "python",
          description: expect.stringContaining("Raspberry Pi"),
        }),
      ])
    );
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pin: "STM32 RMII/MII pins" }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Buffer important sensor data"),
      ])
    );
  });

  it("answers deeper STM32 questions with ADC, PWM, UART, DMA, alternate functions, and lwIP checks", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "STM32 HAL: explain ADC, PWM timer, UART, DMA, I2C, SPI and exact package pin checks.",
    });

    expect(result.response.prose).toContain("85%+");
    expect(result.response.prose).toContain("DMA");
    expect(result.response.pinMapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pin: "ADCx_INy" }),
        expect.objectContaining({ pin: "TIMx_CHy" }),
        expect.objectContaining({ pin: "TX/RX" }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([expect.stringContaining("HAL_TIM_PWM_Start")])
    );
  });

  it("answers EV module basics in high-safety mode with BMS, precharge, contactors, inverter, DC-DC, and OBC", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "Explain EV circuits modules basics: BMS, high voltage battery pack, precharge, contactors, traction inverter, DC-DC converter, on-board charger, and safety.",
    });

    expect(result.response.prose).toContain("85%+");
    expect(result.response.prose).toContain("BMS");
    expect(result.response.prose).toContain("precharge");
    expect(result.response.prose).toContain("traction inverter");
    expect(result.response.precision?.level).toContain("Level 16");
    expect(result.response.precision?.confidence).toBe(
      "Needs bench verification"
    );
    expect(result.response.precision?.safetyWarnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Do not work on live EV high-voltage circuits"),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining("low-voltage isolated trainer"),
      ])
    );
  });

  it("uses a useful global fallback for unclear embedded questions instead of a short vague answer", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "I have a project idea but I do not know the board or parts yet. How should I plan it?",
    });

    expect(result.response.prose).toContain("Global fallback mode");
    expect(result.response.prose).toContain("85%+");
    expect(result.response.codeBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("question template"),
        }),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining("board, module, supply voltage"),
      ])
    );
  });

  it("handles a level-16 industrial logger prompt with formal validation gates, 0-10V scaling, and bench checks", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await createCaller().ask({
      question:
        "I want an ESP32 industrial data logger with ADS1115 for 0-10V analog input, BME280, Wi-Fi upload every 30 seconds, and FreeRTOS tasks. Explain precision wiring and safe checks.",
    });

    expect(result.response.prose).toContain("Level 16");
    expect(result.response.prose).toContain("22k");
    expect(result.response.prose).toContain("10k");
    expect(result.response.precision?.level).toContain("Level 16");
    expect(result.response.precision?.confidence).toBe(
      "Needs bench verification"
    );
    expect(result.response.precision?.safetyWarnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Do not connect a 0-10V signal directly"),
      ])
    );
    expect(result.response.precision?.calculationNotes).toEqual(
      expect.arrayContaining([expect.stringContaining("Vin = Vadc * 3.2")])
    );
    expect(result.response.precision?.validationGates).toEqual(
      expect.arrayContaining([expect.stringContaining("Requirements gate")])
    );
    expect(result.response.precision?.riskControls).toEqual(
      expect.arrayContaining([
        expect.stringContaining("input current limiting"),
      ])
    );
    expect(result.response.precision?.releaseCriteria).toEqual(
      expect.arrayContaining([expect.stringContaining("Error budget")])
    );
    expect(result.response.precision?.errorBudgetNotes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("divider resistor tolerance"),
      ])
    );
    expect(result.response.debugChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Calibrate analog readings"),
      ])
    );
  });
});
