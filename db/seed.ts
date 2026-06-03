import { getDb } from "../api/queries/connection";
import { components } from "./schema";

interface ComponentSeed {
  name: string;
  manufacturer: string;
  category: string;
  description: string;
  datasheetUrl: string;
  specs: Record<string, string>;
}

async function seed() {
  const db = getDb();

  const initialComponents: ComponentSeed[] = [
    {
      name: "ADS1115",
      manufacturer: "Texas Instruments",
      category: "ADC",
      description:
        "16-bit precision analog-to-digital converter with I2C interface, 4 single-ended or 2 differential inputs, programmable gain amplifier",
      datasheetUrl: "https://www.ti.com/lit/ds/symlink/ads1115.pdf",
      specs: {
        resolution: "16-bit",
        channels: "4 SE / 2 Diff",
        interface: "I2C",
        supplyVoltage: "2.0V - 5.5V",
        sampleRate: "8-860 SPS",
        gain: "0.256V - 6.144V PGA",
      },
    },
    {
      name: "ESP32-WROOM-32",
      manufacturer: "Espressif",
      category: "MCU/SoC",
      description:
        "Dual-core Wi-Fi + Bluetooth SoC module with integrated antenna, 4MB flash, rich peripheral interface",
      datasheetUrl:
        "https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf",
      specs: {
        core: "Xtensa LX6 Dual-core @ 240MHz",
        ram: "520KB SRAM",
        flash: "4MB",
        wifi: "802.11 b/g/n",
        bluetooth: "BLE 4.2 + Classic",
        gpio: "34 programmable GPIOs",
      },
    },
    {
      name: "STM32F407VG",
      manufacturer: "STMicroelectronics",
      category: "MCU",
      description:
        "High-performance ARM Cortex-M4 MCU with DSP and FPU, 1MB Flash, 192KB RAM, up to 168MHz",
      datasheetUrl: "https://www.st.com/resource/en/datasheet/stm32f407vg.pdf",
      specs: {
        core: "ARM Cortex-M4 @ 168MHz",
        ram: "192KB SRAM",
        flash: "1MB",
        adc: "3x 12-bit ADC",
        dac: "2x 12-bit DAC",
        gpio: "82 GPIOs",
      },
    },
    {
      name: "MCP23017",
      manufacturer: "Microchip",
      category: "GPIO Expander",
      description:
        "16-bit I/O expander with I2C interface, interrupt output, configurable pull-up resistors",
      datasheetUrl:
        "https://ww1.microchip.com/downloads/en/DeviceDoc/20001952C.pdf",
      specs: {
        channels: "16 GPIO",
        interface: "I2C (up to 1.7MHz)",
        supplyVoltage: "1.8V - 5.5V",
        interrupt: "Open-drain INT output",
        addresses: "8 selectable",
      },
    },
    {
      name: "BME280",
      manufacturer: "Bosch",
      category: "Sensor",
      description:
        "Combined humidity, pressure, and temperature sensor with I2C/SPI interface, low power consumption",
      datasheetUrl:
        "https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/",
      specs: {
        humidity: "0-100% RH, +-3%",
        pressure: "300-1100 hPa, +-1 hPa",
        temperature: "-40 to +85 C, +-1 C",
        interface: "I2C + SPI",
        supplyVoltage: "1.71V - 3.6V",
      },
    },
    {
      name: "PCF8574",
      manufacturer: "Texas Instruments",
      category: "GPIO Expander",
      description:
        "8-bit I/O expander for I2C-bus with interrupt, widely used for LCD interfaces",
      datasheetUrl: "https://www.ti.com/lit/ds/symlink/pcf8574.pdf",
      specs: {
        channels: "8 GPIO",
        interface: "I2C (100kHz)",
        supplyVoltage: "2.5V - 6V",
        interrupt: "Open-drain INT",
        addresses: "8 selectable (0x20-0x27)",
      },
    },
    {
      name: "SSD1306",
      manufacturer: "Solomon Systech",
      category: "Display Driver",
      description:
        "OLED/PLED dot matrix display controller with 128x64 resolution, I2C/SPI/Parallel interface",
      datasheetUrl: "https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf",
      specs: {
        resolution: "128x64",
        interface: "I2C / SPI / Parallel",
        supplyVoltage: "1.65V - 3.3V",
        colors: "Monochrome",
        driverCurrent: "up to 40mA",
      },
    },
    {
      name: "DS18B20",
      manufacturer: "Maxim Integrated",
      category: "Sensor",
      description:
        "1-Wire digital temperature sensor with programmable resolution (9-12 bit), unique 64-bit ID",
      datasheetUrl: "https://datasheets.maximintegrated.com/en/ds/DS18B20.pdf",
      specs: {
        range: "-55 C to +125 C",
        accuracy: "+-0.5 C (from -10 to +85 C)",
        resolution: "9-12 bit configurable",
        interface: "1-Wire",
        supplyVoltage: "3.0V - 5.5V",
      },
    },
    {
      name: "HC-SR04",
      manufacturer: "Various",
      category: "Sensor",
      description:
        "Ultrasonic distance sensor with 2cm - 400cm range, 40kHz ultrasonic transducer pair",
      datasheetUrl:
        "https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf",
      specs: {
        range: "2cm - 400cm",
        resolution: "0.3cm",
        frequency: "40kHz",
        interface: "Trigger + Echo GPIO",
        supplyVoltage: "5V",
        angle: "15 degrees",
      },
    },
    {
      name: "MPU6050",
      manufacturer: "InvenSense/TDK",
      category: "Sensor",
      description:
        "6-axis motion tracking device with 3-axis gyroscope and 3-axis accelerometer, onboard DMP",
      datasheetUrl:
        "https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf",
      specs: {
        accelRange: "+-2g/+-4g/+-8g/+-16g",
        gyroRange: "+-250/+-500/+-1000/+-2000 deg/s",
        interface: "I2C (400kHz)",
        supplyVoltage: "2.375V - 3.46V",
        dmp: "Digital Motion Processor onboard",
      },
    },
  ];

  for (const comp of initialComponents) {
    await db.insert(components).values(comp);
  }

  console.log(`Seeded ${initialComponents.length} components`);
}

seed().catch(console.error);
