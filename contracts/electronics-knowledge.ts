import type { ReferenceData } from "./embedded-answer";

export interface KnowledgeEntry {
  id: string;
  title: string;
  source: string;
  url: string;
  topics: string[];
  facts: string[];
  checks: string[];
}

const commonPowerChecks = [
  "Confirm the module voltage before wiring signal pins.",
  "Use a common ground between every connected board or module.",
  "Add local decoupling near IC power pins when the circuit is noisy or fast.",
];

export const electronicsKnowledgeBase: KnowledgeEntry[] = [
  {
    id: "esp32-datasheet",
    title: "ESP32 Series Datasheet",
    source: "Espressif",
    url: "https://documentation.espressif.com/esp32_datasheet_en.html",
    topics: [
      "esp32",
      "gpio",
      "adc",
      "dac",
      "i2c",
      "spi",
      "uart",
      "wifi",
      "bluetooth",
      "power",
      "sleep",
      "strapping",
    ],
    facts: [
      "ESP32 is a 3.3V microcontroller family with Wi-Fi, Bluetooth, GPIO, I2C, SPI, UART, ADC, DAC, PWM, and low-power modes.",
      "Classic ESP32 ADC readings are useful but can be nonlinear; use calibration or an external ADC for accurate measurement.",
      "GPIO6 to GPIO11 are usually connected to flash on common modules and should not be used as normal project GPIO.",
      "Some ESP32 pins are strapping pins, so attached circuits can affect boot mode.",
    ],
    checks: [
      "Check whether the chosen GPIO is input-only, output-capable, boot-strapping, ADC-capable, or flash-reserved.",
      "Use a stable 3.3V supply with enough peak current for Wi-Fi transmission.",
      "Keep the antenna area clear of copper, wires, metal, and tall components.",
    ],
  },
  {
    id: "esp32-hardware-design",
    title: "ESP32 Hardware Design Guidelines",
    source: "Espressif",
    url: "https://documentation.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/index.html",
    topics: [
      "esp32",
      "schematic",
      "pcb",
      "power",
      "adc",
      "antenna",
      "decoupling",
      "hardware",
    ],
    facts: [
      "ESP32 hardware design depends heavily on clean power, correct boot strapping, RF layout, and suitable decoupling.",
      "For ESP32 ADC measurements, a small filter capacitor near the ADC input can improve noisy readings.",
    ],
    checks: [
      "Verify EN/reset pull-up and boot button wiring.",
      "Place bypass capacitors close to module power pins.",
      "Avoid routing noisy signals through the RF antenna keepout area.",
    ],
  },
  {
    id: "esp-idf-wifi",
    title: "ESP-IDF Wi-Fi Driver Guide",
    source: "Espressif",
    url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/wifi.html",
    topics: ["esp32", "wifi", "wi-fi", "disconnect", "rssi", "network"],
    facts: [
      "ESP32 Wi-Fi work should be tested with clear connection state logging and signal strength readings.",
      "ESP32 Wi-Fi uses the 2.4GHz band; it will not join a 5GHz-only network.",
    ],
    checks: [
      "Print WiFi.status() and WiFi.RSSI() during testing.",
      "Confirm router settings allow the device to connect.",
      "Test near the router before debugging firmware logic.",
    ],
  },
  {
    id: "esp-idf-mqtt-internet",
    title: "ESP-IDF MQTT and Internet Protocol Documentation",
    source: "Espressif",
    url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/protocols/mqtt.html",
    topics: [
      "esp32",
      "internet",
      "wifi",
      "wi-fi",
      "mqtt",
      "http",
      "https",
      "tls",
      "cloud",
      "api",
      "iot",
      "websocket",
    ],
    facts: [
      "ESP-IDF includes networking components for Wi-Fi, TCP/IP, HTTP, HTTPS, WebSocket, MQTT, SNTP, and other IoT protocols.",
      "MQTT is a lightweight publish/subscribe protocol commonly used for IoT telemetry and command messages.",
      "Production internet-connected devices should use TLS, certificate validation, reconnect logic, and local buffering for offline periods.",
    ],
    checks: [
      "Confirm the device gets an IP address, DNS works, and the server hostname resolves.",
      "Use TLS for cloud traffic and validate the server certificate or certificate bundle.",
      "Add reconnect backoff, watchdog handling, and an offline queue before field testing.",
      "Log Wi-Fi status, RSSI, IP address, MQTT/HTTP response codes, and retry counts.",
    ],
  },
  {
    id: "arduino-board-manager",
    title: "Arduino Boards Manager Guide",
    source: "Arduino",
    url: "https://support.arduino.cc/hc/en-us/articles/360016119519-Add-boards-to-Arduino-IDE",
    topics: ["arduino", "ide", "install", "boards manager", "esp32", "upload"],
    facts: [
      "Arduino IDE uses board cores so the IDE can compile and upload code for different microcontroller families.",
      "For ESP32 beginner work, board support must be installed before selecting the ESP32 board and port.",
    ],
    checks: [
      "Install the correct board core.",
      "Select the correct board name and COM port.",
      "Use a data USB cable, not a charge-only cable.",
    ],
  },
  {
    id: "arduino-documentation",
    title: "Arduino Documentation",
    source: "Arduino",
    url: "https://docs.arduino.cc/",
    topics: [
      "arduino",
      "uno",
      "nano",
      "mega",
      "mkr",
      "portenta",
      "giga",
      "hardware",
      "documentation",
      "library",
      "code",
    ],
    facts: [
      "Arduino documentation covers official boards, IDE setup, language reference, built-in examples, tutorials, and library documentation.",
      "Arduino projects are usually easiest to debug by starting with one built-in example, then adding one sensor or feature at a time.",
      "Arduino libraries provide tested code for common sensors, displays, motors, and communication modules.",
    ],
    checks: [
      "Confirm the exact board name before using a pin map.",
      "Install the board package and required libraries from Arduino IDE before compiling.",
      "Open library examples after installing a sensor library and test the smallest example first.",
    ],
  },
  {
    id: "arduino-uno-r4-wifi",
    title: "Arduino UNO R4 WiFi User Manual",
    source: "Arduino",
    url: "https://docs.arduino.cc/tutorials/uno-r4-wifi/cheat-sheet",
    topics: [
      "arduino",
      "uno r4",
      "uno r4 wifi",
      "pinout",
      "i2c",
      "spi",
      "uart",
      "dac",
      "pwm",
      "analog",
    ],
    facts: [
      "UNO R4 WiFi uses a Renesas RA4M1 microcontroller and has an onboard ESP32 module for connectivity support.",
      "UNO R4 WiFi digital pins use 5V logic, while many modern sensors and Raspberry Pi/ESP boards use 3.3V logic.",
      "UNO R4 WiFi exposes I2C on A4/SDA and A5/SCL, SPI on D10-D13, UART on D0/D1, and a DAC-capable analog output on A0.",
      "UNO R4 WiFi has USB serial and a separate hardware UART on D0/D1 through Serial1.",
    ],
    checks: [
      "Use level shifting when a 3.3V-only device connects to a 5V Arduino signal.",
      "Avoid D0/D1 for normal GPIO when Serial1 UART is needed.",
      "Check whether the project needs Wire or Wire1 when using board-specific I2C connectors.",
    ],
  },
  {
    id: "arduino-classic-boards",
    title: "Arduino Classic Board Pin References",
    source: "Arduino",
    url: "https://docs.arduino.cc/hardware/",
    topics: [
      "arduino",
      "uno r3",
      "mega 2560",
      "nano",
      "nano every",
      "pinout",
      "digital",
      "analog",
      "pwm",
      "uart",
    ],
    facts: [
      "Arduino UNO-style boards commonly provide D0-D13 digital pins, A0-A5 analog pins, I2C on A4/A5, and SPI through D10-D13 or the ICSP header.",
      "Arduino Mega 2560 provides many more I/O pins, 16 analog inputs, multiple UARTs, I2C on D20/D21, and SPI on D50-D53 or ICSP.",
      "Arduino Nano-style boards are breadboard-friendly and usually use UNO-like pin concepts, but exact voltage and processor features depend on the Nano model.",
    ],
    checks: [
      "Check whether the board is 5V or 3.3V before attaching sensors.",
      "Do not use D0/D1 if USB serial upload/debugging is still needed.",
      "For Mega SPI, use D50-D53 or the ICSP header instead of UNO D10-D13 assumptions.",
    ],
  },
  {
    id: "arduino-wire-spi-serial",
    title: "Arduino Wire, SPI, and Serial References",
    source: "Arduino",
    url: "https://docs.arduino.cc/language-reference/",
    topics: [
      "arduino",
      "wire",
      "i2c",
      "spi",
      "serial",
      "uart",
      "communication",
      "protocol",
      "bus",
    ],
    facts: [
      "Arduino Wire is the standard library for I2C communication with sensors, displays, expanders, and many modules.",
      "Arduino SPI uses clock, data-out, data-in, and chip-select signals; pin locations vary by board.",
      "Arduino Serial is used for USB serial debugging and UART communication, but some boards separate USB serial from hardware UART pins.",
    ],
    checks: [
      "For I2C, confirm SDA, SCL, address, pull-up resistors, voltage level, and bus length.",
      "For SPI, confirm SCK, COPI/MOSI, CIPO/MISO, chip select, mode, and clock speed.",
      "For UART, cross TX to RX, match baud rate, and share ground.",
    ],
  },
  {
    id: "arduino-wifi-mqtt-ethernet",
    title: "Arduino Wi-Fi, MQTT, and Ethernet References",
    source: "Arduino",
    url: "https://docs.arduino.cc/language-reference/en/functions/wifi/overview/",
    topics: [
      "arduino",
      "internet",
      "wifi",
      "wi-fi",
      "wifis3",
      "wifinina",
      "ethernet",
      "mqtt",
      "cloud",
      "http",
      "https",
      "api",
      "iot",
    ],
    facts: [
      "Arduino Wi-Fi support depends on the board and library, such as WiFiS3 for UNO R4 WiFi and WiFiNINA for many MKR/Nano IoT boards.",
      "ArduinoMqttClient can send and receive MQTT messages across compatible network clients.",
      "Arduino Ethernet boards and shields provide client/server networking, DHCP, and DNS support through the Ethernet library.",
    ],
    checks: [
      "Use the Wi-Fi library that matches the exact Arduino board.",
      "Keep Wi-Fi credentials outside committed source files.",
      "Confirm DHCP, DNS, and broker/server reachability before debugging application payloads.",
      "For MQTT, set a stable client ID and handle disconnect/reconnect events.",
    ],
  },
  {
    id: "ads1115-ti",
    title: "ADS1115 Product Page and Datasheet",
    source: "Texas Instruments",
    url: "https://www.ti.com/product/ADS1115",
    topics: ["ads1115", "adc", "i2c", "analog", "voltage", "sensor"],
    facts: [
      "ADS1115 is a 16-bit delta-sigma ADC with I2C interface, internal reference, PGA, comparator, and up to 860 samples per second.",
      "ADS1115 supports four single-ended inputs or differential measurements depending on configuration.",
      "The device supply range supports common 3.3V microcontroller designs.",
    ],
    checks: [
      "Confirm I2C address, commonly 0x48 when ADDR is tied to GND.",
      "Keep analog input voltage inside the selected PGA range.",
      "Use a voltage divider before measuring voltages above the ADC input range.",
    ],
  },
  {
    id: "bme280-bosch",
    title: "BME280 Product Page and Datasheet",
    source: "Bosch Sensortec",
    url: "https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/",
    topics: [
      "bme280",
      "bmp280",
      "temperature",
      "humidity",
      "pressure",
      "i2c",
      "spi",
      "weather",
    ],
    facts: [
      "BME280 measures temperature, relative humidity, and barometric pressure.",
      "BME280 supports I2C and SPI and is designed for low-current mobile and wearable use.",
      "BME280 VDD is a low-voltage sensor supply; use a breakout board regulator only if the module specifically supports 5V input.",
    ],
    checks: [
      "Try both common I2C addresses, 0x76 and 0x77.",
      "Avoid heating the sensor with nearby regulators or high-current parts.",
      "Keep airflow available around the sensor package.",
    ],
  },
  {
    id: "stm32-gpio",
    title: "STM32Cube HAL GPIO Guide",
    source: "STMicroelectronics",
    url: "https://dev.st.com/stm32cube-docs/stm32c5xx-hal-drivers/2.0.0/en/docs/drivers/hal_drivers/gpio/hal_gpio_how_to_use.html",
    topics: [
      "stm32",
      "gpio",
      "hal",
      "alternate function",
      "pullup",
      "pulldown",
    ],
    facts: [
      "STM32 GPIO pins can be configured as input, output, alternate function, or analog.",
      "Peripheral use normally requires selecting the correct alternate function for the chosen pin.",
      "Internal pull-up and pull-down resistors can be enabled when the external circuit needs a defined idle state.",
    ],
    checks: [
      "Enable the GPIO port clock before configuring pins.",
      "Check alternate function mapping for the exact STM32 part number.",
      "Do not leave high-impedance inputs floating.",
    ],
  },
  {
    id: "stm32-i2c-spi",
    title: "STM32Cube HAL I2C and SPI Guides",
    source: "STMicroelectronics",
    url: "https://dev.st.com/stm32cube-docs/stm32c5xx-hal-drivers/2.0.0/en/docs/drivers/hal_drivers/i2c/hal_i2c_how_to_use.html",
    topics: ["stm32", "i2c", "spi", "hal", "dma", "interrupt", "sensor"],
    facts: [
      "STM32 HAL I2C and SPI flows require peripheral clock setup, GPIO alternate-function setup, and then peripheral initialization.",
      "I2C is open-drain and needs pull-up resistors; SPI is push-pull and needs chip-select handling.",
      "Polling is simplest for first tests; interrupts or DMA are useful after basic communication works.",
    ],
    checks: [
      "Scope or logic-analyze SCL/SDA or SCK/MOSI/MISO before blaming the sensor.",
      "Confirm 7-bit I2C address formatting expected by the HAL call.",
      "For SPI, verify mode, clock speed, bit order, and chip-select timing.",
    ],
  },
  {
    id: "stm32-peripheral-architecture",
    title: "STM32Cube HAL Peripheral Setup Pattern",
    source: "STMicroelectronics",
    url: "https://dev.st.com/stm32cube-docs/stm32c5xx-hal-drivers/2.0.0/en/docs/drivers/hal_drivers/gpio/hal_gpio_how_to_use.html",
    topics: [
      "stm32",
      "hal",
      "cubeide",
      "cubemx",
      "adc",
      "pwm",
      "timer",
      "uart",
      "usart",
      "dma",
      "interrupt",
      "clock",
      "gpio",
    ],
    facts: [
      "STM32 projects usually require clock-tree setup, GPIO mode setup, peripheral initialization, and then explicit start/read/write calls.",
      "GPIO pins used by peripherals normally need the correct alternate function for the exact STM32 part and package.",
      "DMA and interrupts are useful after polling works, but they add buffer lifetime, priority, and callback-order risks.",
    ],
    checks: [
      "Verify system clock, peripheral clock, and GPIO port clock are all enabled.",
      "Check the exact package pinout and alternate-function table for the selected STM32 part number.",
      "Start ADC, PWM, timers, UART, I2C, or SPI explicitly after Cube-generated initialization.",
      "When using DMA, keep buffers valid and aligned for the whole transfer.",
    ],
  },
  {
    id: "stm32-lwip-ethernet",
    title: "STM32Cube LwIP TCP/IP Stack Documentation",
    source: "STMicroelectronics",
    url: "https://dev.st.com/stm32cube-docs/mw-lwip/2.0.0/en/overview.html",
    topics: [
      "stm32",
      "internet",
      "ethernet",
      "lwip",
      "tcp",
      "udp",
      "http",
      "mqtt",
      "dhcp",
      "network",
      "lan8742",
      "phy",
    ],
    facts: [
      "STM32 Ethernet projects commonly use the MAC peripheral, an external PHY, RMII/MII pins, DMA descriptors, and the LwIP TCP/IP stack.",
      "STM32 Ethernet stability depends on correct clocking, PHY address, RMII/MII wiring, cache/MPU settings on Cortex-M7 parts, and descriptor memory placement.",
      "DHCP and ping should work before adding HTTP, MQTT, or application protocols.",
    ],
    checks: [
      "Confirm the PHY address, reset pin, reference clock, RMII/MII pin mapping, and link status.",
      "For Cortex-M7 STM32 Ethernet, review cache coherency, MPU regions, and DMA buffer placement.",
      "Test link, DHCP, ping, then TCP/UDP, then HTTP/MQTT in that order.",
      "Log link-up/link-down, IP address, DHCP state, and socket error codes.",
    ],
  },
  {
    id: "raspberry-pi-pico",
    title: "Raspberry Pi Pico SDK Hardware APIs",
    source: "Raspberry Pi",
    url: "https://www.raspberrypi.com/documentation/pico-sdk/hardware.html",
    topics: [
      "pico",
      "rp2040",
      "rp2350",
      "micropython",
      "gpio",
      "adc",
      "i2c",
      "spi",
      "uart",
      "pwm",
    ],
    facts: [
      "Raspberry Pi Pico boards expose multifunction GPIO that can be mapped to UART, I2C, SPI, PWM, ADC, and PIO functions.",
      "Pico ADC inputs are on specific GPIO pins, so analog wiring must use ADC-capable pins.",
    ],
    checks: [
      "Confirm the chosen GPIO supports the peripheral function you want.",
      "Use 3.3V logic with Pico GPIO.",
      "When using MicroPython, test the peripheral with a minimal script first.",
    ],
  },
  {
    id: "raspberry-pi-sbc-gpio",
    title: "Raspberry Pi GPIO and 40-pin Header Documentation",
    source: "Raspberry Pi",
    url: "https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#gpio-and-the-40-pin-header",
    topics: [
      "raspberry pi",
      "rpi",
      "raspi",
      "pi 3",
      "pi 4",
      "pi 5",
      "zero",
      "gpio",
      "40 pin",
      "i2c",
      "spi",
      "uart",
      "python",
      "gpiozero",
    ],
    facts: [
      "Current Raspberry Pi single-board computers use a 40-pin GPIO header for power, ground, GPIO, I2C, SPI, UART, and alternate functions.",
      "Raspberry Pi GPIO uses 3.3V logic; outputs go high at 3.3V and GPIO inputs are not 5V tolerant.",
      "Common Raspberry Pi I2C uses GPIO2 for SDA and GPIO3 for SCL, SPI0 uses GPIO10/GPIO9/GPIO11 plus chip-enable pins, and UART commonly uses GPIO14/GPIO15.",
      "Raspberry Pi OS includes GPIO Zero tools, and the pinout command can show a board-specific GPIO reference.",
    ],
    checks: [
      "Never connect a 5V sensor output directly to Raspberry Pi GPIO.",
      "Use physical pin numbering and BCM GPIO numbering carefully; they are not the same.",
      "Use a transistor, MOSFET, relay driver, motor controller, or H-bridge instead of driving motors or relays directly from GPIO.",
      "Enable I2C, SPI, or UART in Raspberry Pi configuration before testing those buses.",
    ],
  },
  {
    id: "raspberry-pi-networking",
    title: "Raspberry Pi Networking Documentation",
    source: "Raspberry Pi",
    url: "https://www.raspberrypi.com/documentation/computers/configuration.html",
    topics: [
      "raspberry pi",
      "rpi",
      "raspi",
      "internet",
      "network",
      "wifi",
      "wi-fi",
      "ethernet",
      "ssh",
      "python",
      "http",
      "mqtt",
      "api",
      "cloud",
    ],
    facts: [
      "Raspberry Pi devices can connect through Ethernet, built-in Wi-Fi on supported models, or USB network adapters.",
      "Raspberry Pi OS can use DHCP for normal networking and can be configured for Wi-Fi, Ethernet, SSH, and remote access.",
      "Python on Raspberry Pi is suitable for HTTP APIs, MQTT clients, local services, dashboards, and sensor gateways.",
    ],
    checks: [
      "Confirm IP address, gateway, DNS, and internet reachability before debugging Python code.",
      "Use Ethernet for first tests when Wi-Fi reliability is unknown.",
      "Keep secrets such as API keys and Wi-Fi passwords out of source control.",
      "Add reconnect and retry handling for long-running sensor gateways.",
    ],
  },
  {
    id: "common-arduino-sensors",
    title: "Arduino Sensor and Actuator Library References",
    source: "Arduino and Adafruit",
    url: "https://docs.arduino.cc/libraries/",
    topics: [
      "sensor",
      "sensors",
      "dht",
      "dht11",
      "dht22",
      "humidity",
      "temperature",
      "ultrasonic",
      "hc-sr04",
      "servo",
      "oled",
      "mpu6050",
      "imu",
      "pir",
      "gas",
      "relay",
      "motor",
    ],
    facts: [
      "DHT11/DHT22 sensors provide low-cost temperature and humidity readings but are slow and less precise than higher-end I2C sensors.",
      "HC-SR04 ultrasonic modules use trigger and echo pins; many modules output 5V echo and need level shifting before 3.3V boards.",
      "Servo motors use a PWM-style control signal but should normally be powered from a separate suitable supply, not from a small MCU 5V pin.",
      "I2C sensors and displays commonly share SDA/SCL wires, but each device needs a unique I2C address.",
    ],
    checks: [
      "Install the correct sensor library and run its official example first.",
      "Check whether the breakout board already includes pull-ups, regulators, or level shifting.",
      "Power motors, relays, and servos from a supply sized for their current spikes.",
      "For analog sensors, check the maximum output voltage before connecting an ADC pin.",
    ],
  },
  {
    id: "basic-circuits",
    title: "Arduino Built-in Examples for Basic Circuits",
    source: "Arduino",
    url: "https://docs.arduino.cc/built-in-examples/",
    topics: [
      "basic circuit",
      "circuit",
      "led",
      "resistor",
      "button",
      "pullup",
      "pulldown",
      "voltage divider",
      "mosfet",
      "transistor",
      "relay",
      "diode",
      "capacitor",
      "breadboard",
    ],
    facts: [
      "Arduino built-in examples cover beginner circuits such as Blink, Button, AnalogInput, and simple serial debugging.",
      "An LED needs a current-limiting resistor; a bare LED directly on a GPIO pin can damage the LED or the board.",
      "Buttons need a defined idle state using an internal or external pull-up/pull-down resistor.",
      "A voltage divider scales a voltage by Vout = Vin * Rbottom / (Rtop + Rbottom).",
    ],
    checks: [
      "Calculate LED resistor value before wiring: R = (Vsupply - Vled) / current.",
      "Use a flyback diode across relay coils and other inductive loads.",
      "Use a logic-level MOSFET or transistor driver for loads that need more current than a GPIO pin can supply.",
      "Measure divider output with a multimeter before connecting it to a microcontroller input.",
    ],
  },
  {
    id: "ev-high-voltage-safety",
    title: "Electric and Hybrid Vehicle Battery, Charging, and Safety",
    source: "NHTSA",
    url: "https://www.nhtsa.gov/vehicle-safety/electric-and-hybrid-vehicles",
    topics: [
      "ev",
      "electric vehicle",
      "hev",
      "hybrid",
      "high voltage",
      "hv",
      "battery",
      "charging",
      "safety",
      "thermal runaway",
    ],
    facts: [
      "EV high-voltage battery systems are different from normal 12V vehicle systems and require special safety procedures.",
      "Damaged or energized high-voltage EV systems can create shock, fire, and thermal hazards.",
      "EV service and design work should follow manufacturer procedures, standards, isolation rules, PPE requirements, and qualified supervision.",
    ],
    checks: [
      "Do not work on live high-voltage EV wiring without formal training, PPE, and approved procedures.",
      "Assume high-voltage components may remain energized until verified safe by the correct process.",
      "Use low-voltage trainer circuits for learning precharge, contactor logic, and BMS concepts.",
      "Escalate vehicle repair or pack-level work to qualified EV technicians.",
    ],
  },
  {
    id: "ev-bms",
    title: "Automotive Battery Management System for EVs",
    source: "STMicroelectronics",
    url: "https://www.st.com/en/applications/electro-mobility/automotive-battery-management-system-bms.html",
    topics: [
      "ev",
      "electric vehicle",
      "bms",
      "battery management",
      "cell balancing",
      "cell monitor",
      "soc",
      "soh",
      "precharge",
      "contactor",
      "battery junction box",
      "isolation",
    ],
    facts: [
      "An EV BMS monitors cell voltages, pack voltage, current, temperature, state of charge, state of health, faults, and balancing.",
      "EV battery systems commonly include cell monitor units, a battery management unit, current sensing, isolation monitoring, contactors, precharge, and protection devices.",
      "Precharge limits inrush current before the main contactors connect the high-voltage pack to large DC-link capacitors.",
    ],
    checks: [
      "Verify cell count, chemistry, maximum/minimum cell voltage, temperature sensors, current sensor range, and isolation requirement.",
      "Check contactor weld detection, precharge timeout, fuse/pyrofuse strategy, and emergency shutdown behavior.",
      "Define fault states for overvoltage, undervoltage, overtemperature, undertemperature, overcurrent, isolation fault, and communication loss.",
      "Use automotive-qualified parts and standards-driven review for real vehicle systems.",
    ],
  },
  {
    id: "ev-traction-inverter",
    title: "EV Traction Inverter Application Overview",
    source: "Infineon",
    url: "https://www.infineon.com/cms/en/applications/automotive/electric-drive-train/traction-inverter/",
    topics: [
      "ev",
      "electric vehicle",
      "traction inverter",
      "inverter",
      "motor controller",
      "igbt",
      "sic",
      "mosfet",
      "gate driver",
      "dc link",
      "resolver",
      "phase current",
      "regenerative braking",
    ],
    facts: [
      "A traction inverter converts high-voltage DC from the battery into controlled AC phase currents for the traction motor.",
      "Traction inverter design involves power modules, isolated gate drivers, current sensing, DC-link capacitors, thermal design, protection, and functional-safety monitoring.",
      "Regenerative braking reverses power flow so the motor/inverter can return energy to the battery when conditions allow.",
    ],
    checks: [
      "Do not prototype traction inverter high-voltage power stages without qualified supervision and appropriate lab safety controls.",
      "For learning, start with low-voltage BLDC motor-driver trainer boards before studying full EV traction stages.",
      "Validate gate-drive supply, dead time, overcurrent protection, desaturation/short-circuit response, and thermal sensing.",
      "Check isolation, creepage/clearance, DC-link discharge, and emergency shutdown paths.",
    ],
  },
  {
    id: "ev-power-conversion",
    title: "EV Power Conversion Blocks",
    source: "NXP",
    url: "https://www.nxp.com/applications/EV-POWER-INVERTER",
    topics: [
      "ev",
      "electric vehicle",
      "dc-dc",
      "dcdc",
      "on-board charger",
      "obc",
      "charger",
      "inverter",
      "power module",
      "isolation",
      "12v",
      "auxiliary",
    ],
    facts: [
      "EV power electronics commonly include the traction inverter, high-voltage battery, DC-DC converter, on-board charger, thermal management, and low-voltage auxiliary system.",
      "A DC-DC converter steps the high-voltage battery bus down to the low-voltage vehicle electrical system.",
      "An on-board charger converts external AC charging input into controlled DC battery charging under BMS and vehicle control.",
    ],
    checks: [
      "Separate educational block diagrams from real high-voltage construction details.",
      "Verify isolation boundaries between high-voltage and low-voltage systems.",
      "Check discharge paths for DC-link capacitors and service-safe states.",
      "Use qualified automotive power modules, gate drivers, sensing, and protection for real vehicle work.",
    ],
  },
  {
    id: "freertos",
    title: "FreeRTOS Kernel Documentation",
    source: "FreeRTOS",
    url: "https://www.freertos.org/Documentation/02-Kernel/04-API-references/10-Semaphore-and-Mutexes/00-Semaphores",
    topics: [
      "freertos",
      "rtos",
      "task",
      "queue",
      "semaphore",
      "mutex",
      "notification",
      "embedded",
    ],
    facts: [
      "FreeRTOS projects are easier to debug when tasks communicate through queues, semaphores, mutexes, or direct task notifications instead of shared global state.",
      "Direct-to-task notifications can be a lightweight alternative for many single-receiver synchronization cases.",
    ],
    checks: [
      "Avoid blocking forever inside a task unless that is intentional.",
      "Protect shared resources with a mutex or redesign using message passing.",
      "Measure stack high-water marks when tasks behave strangely.",
    ],
  },
  {
    id: "tinyml",
    title: "TensorFlow Lite for Microcontrollers",
    source: "TensorFlow",
    url: "https://www.tensorflow.org/lite/microcontrollers",
    topics: [
      "tinyml",
      "machine learning",
      "ml",
      "ai",
      "model",
      "microcontroller",
    ],
    facts: [
      "Embedded ML is usually about small quantized models that fit within tight RAM, flash, and latency limits.",
      "A practical TinyML workflow is collect data, train off-device, quantize, test, then deploy inference to the microcontroller.",
    ],
    checks: [
      "Estimate RAM, flash, and inference time before selecting a model.",
      "Keep a separate test set that was not used during training.",
      "Start with a simple classifier before trying larger neural networks.",
    ],
  },
];

export function findRelevantKnowledge(question: string, limit = 4) {
  const normalized = question
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim();
  const compact = normalized.replace(/\s+/g, "");

  return electronicsKnowledgeBase
    .map(entry => {
      const topicScore = entry.topics.reduce((score, topic) => {
        const normalizedTopic = topic.toLowerCase();
        const compactTopic = normalizedTopic.replace(/\s+/g, "");
        if (
          normalized.includes(normalizedTopic) ||
          compact.includes(compactTopic)
        ) {
          return score + 4;
        }
        return score;
      }, 0);
      const text =
        `${entry.title} ${entry.source} ${entry.facts.join(" ")}`.toLowerCase();
      const wordScore = normalized
        .split(" ")
        .filter(word => word.length > 2 && text.includes(word)).length;

      return { entry, score: topicScore + wordScore };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.entry);
}

export function referencesFromKnowledge(
  entries: KnowledgeEntry[]
): ReferenceData[] {
  const seen = new Set<string>();
  return entries
    .filter(entry => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    })
    .map(entry => ({
      title: entry.title,
      url: entry.url,
      source: entry.source,
    }));
}

export function checksFromKnowledge(entries: KnowledgeEntry[]) {
  return [
    ...commonPowerChecks,
    ...entries.flatMap(entry => entry.checks),
  ].slice(0, 10);
}

export function factsFromKnowledge(entries: KnowledgeEntry[]) {
  return entries.flatMap(entry => entry.facts).slice(0, 8);
}

export function buildKnowledgeBrief(question: string) {
  const entries = findRelevantKnowledge(question, 5);
  if (entries.length === 0) {
    return "No specific local electronics source matched. Use general engineering reasoning and ask for missing hardware details only when needed.";
  }

  return entries
    .map(
      entry =>
        `${entry.title} (${entry.source})\nFacts:\n- ${entry.facts.join("\n- ")}\nChecks:\n- ${entry.checks.join("\n- ")}\nURL: ${entry.url}`
    )
    .join("\n\n");
}
