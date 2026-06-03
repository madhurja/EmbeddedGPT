# EmbeddedGPT

EmbeddedGPT is a browser-based electronics and embedded-systems assistant. It combines a React/Vite interface, a Hono/tRPC backend, optional OpenAI integration, and a curated local electronics knowledge layer for practical answers even when no AI key is configured.

## What It Can Answer

- ESP32 setup, GPIO, I2C, Wi-Fi, ADC, and starter code
- Arduino UNO R3/R4, Nano, Mega, MKR, Portenta, and GIGA-style board guidance, starter code, pin mapping, and board-selection checks
- Raspberry Pi 3/4/5/Zero 40-pin GPIO, Python/GPIO Zero examples, I2C, SPI, UART, and 3.3V safety warnings
- ADS1115 and BME280 wiring, checks, code, and references
- Common sensors and modules including DHT11/DHT22, HC-SR04, OLED/I2C displays, IMUs, servos, relays, and motor-driver style circuits
- Communication choices across I2C, SPI, UART, OneWire, CAN, RS485, MQTT, and practical debugging steps
- Internet implementations for ESP32, Arduino Wi-Fi/Ethernet boards, Raspberry Pi, and STM32 Ethernet/LwIP, including HTTP, MQTT, TLS, retry logic, and offline buffering
- Basic electronics circuits such as LED resistors, buttons with pull-ups, voltage dividers, MOSFET/transistor drivers, relay flyback protection, and safe breadboard wiring
- STM32 HAL setup patterns for GPIO, ADC, PWM/timers, UART, I2C, SPI, DMA, Ethernet/LwIP, and debugging
- EV module basics for BMS, precharge, contactors, traction inverter, DC-DC converter, on-board charger, thermal system, and high-voltage safety concepts
- Raspberry Pi Pico GPIO, ADC, I2C, SPI, UART, and MicroPython basics
- FreeRTOS tasks, queues, semaphores, mutexes, and debugging
- TinyML / embedded machine-learning project planning
- Global fallback answers for unclear embedded questions, with an 85%+ practical precision target and clear missing-detail prompts
- Adaptive local learning from previous tasks, including preferred boards, frameworks, modules, answer style, user corrections, verified working notes, and safety preferences
- Accuracy gates on answers, showing target precision, source grounding, known limits, missing details, and next verification steps before real hardware use
- Answer self-audits that classify detected domains, boards, protocols, risk level, difficulty level, coverage score, open questions, and precision-improvement actions
- Level 16 formal-validation answers for high-risk industrial prompts, including assumptions, safety warnings, calculations, missing details, validation gates, risk controls, release criteria, error-budget notes, and bench verification steps

## Requirements

- Node.js 20 or newer
- npm

## Setup

```powershell
npm.cmd install
copy .env.example .env
```

For local manual testing, you can leave `.env` mostly empty. The app will use local demo login and local electronics answers.

For production AI answers, set:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

## Development

```powershell
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:3000/
```

## Manual Browser Testing

This mode builds the app, enables the local demo sign-in, and runs the real backend API server.

```powershell
npm.cmd run build:manual
npm.cmd run preview:manual
```

Open:

```text
http://127.0.0.1:4173/
```

The terminal should say:

```text
Server running on http://localhost:4173/
```

## Quality Checks

Run these before pushing to GitHub:

```powershell
npm.cmd run check
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

## Important Notes

- Do not commit `.env`.
- Do not commit `node_modules` or `dist`.
- `vite preview` only serves the static page. Use `npm.cmd run preview:manual` when you want the chat API to work locally after a production build.
- Without `OPENAI_API_KEY`, the project still answers using the built-in local electronics knowledge engine.
- Adaptive learning is stored locally in the browser's `localStorage`. It is used as a hint for future answers, but datasheets, safety warnings, and bench verification always override memory.

## GitHub Push

After creating an empty GitHub repo, initialize and push from this folder:

```powershell
git init
git add .
git commit -m "Initial EmbeddedGPT project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Use GitHub's normal sign-in flow, GitHub Desktop, Git Credential Manager, or GitHub CLI. Avoid pasting personal access tokens directly into chat or source files.
