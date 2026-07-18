# Envision Glasses


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Platform](https://img.shields.io/badge/platform-ESP32%20%7C%20Raspberry%20Pi%20%7C%20React%20Native-blue.svg)]()
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4.svg)](https://aistudio.google.com/)

**An affordable, AI-powered smart mobility and assistance solution for visually impaired individuals.**

Envision Glasses is a smart wearable designed to enhance independence, safety, and accessibility for visually impaired users in their daily lives. It combines a camera, AI-powered processing, ultrasonic sensors, and a mobile companion application to provide real-time audio feedback and guidance.

---

## Overview

Inspired by smart glasses technology, Envision Glasses integrates multiple assistive features into a single wearable device. The system connects wirelessly to a smartphone via Bluetooth Low Energy (BLE), offloading heavy AI processing to cloud services while maintaining low-latency sensor feedback on the device itself.

The project is built across three modules:

- **Hardware** — Embedded firmware for ESP32-CAM and Raspberry Pi
- **Mobile App** — React Native companion application (Expo)
- **Simulator** — Interactive web-based demonstration environment

---

## Key Features

### Obstacle & Object Detection
An HC-SR04 ultrasonic proximity sensor continuously monitors the environment. When an object is detected within a configurable threshold (default 35 cm), the system triggers both a local buzzer/vibration alert and a voice warning through the mobile app.

### AI-Powered OCR Reading
The front-facing camera captures text from signs, documents, books, product labels, and other surfaces. Using Google Gemini's multimodal capabilities, the system reads extracted text aloud through text-to-speech.

### Voice Assistant (Conversational AI)
A fully voice-operated AI assistant powered by Gemini answers questions about the user's environment, provides guidance, and performs contextual tasks. The assistant works in both text and voice input modes.

### Voice-Guided Navigation
The mobile app provides turn-by-turn spoken route directions. Users can select preset destinations (Pharmacy, Central Park, Grocery Store) or input custom locations. Navigation includes obstacle warnings along the route.

### Integrated Media Player
A built-in audio hub supports playback of audiobooks, music, and ambient sounds with simple controls accessible through physical buttons on the glasses or voice commands.

### Real-Time Telemetry Dashboard
The companion app displays live BLE connection status, battery level, proximity sensor readings, and critical obstacle alerts with visual and haptic feedback.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Envision Glasses                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  OV2640 Cam  │  │  HC-SR04     │  │  Buzzer /    │  │
│  │  (Video Feed)│  │  (Proximity) │  │  Vibration   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │           │
│         └────────┬────────┴──────────────────┘           │
│                  │                                       │
│         ┌────────┴────────┐                              │
│         │   ESP32-CAM /   │                              │
│         │   Raspberry Pi  │                              │
│         └────────┬────────┘                              │
│                  │                                       │
│        ┌─────────┴─────────┐                             │
│        │  Wi-Fi AP + BLE   │                             │
│        └─────────┬─────────┘                             │
└──────────────────┼──────────────────────────────────────┘
                   │
          ┌────────┴────────┐
          │  Mobile App     │
          │  (React Native) │
          ├─────────────────┤
          │  OCR Scanner    │
          │  Navigation     │
          │  AI Assistant   │
          │  Media Player   │
          │  Settings       │
          └────────┬────────┘
                   │
          ┌────────┴────────┐
          │  Cloud AI       │
          │  (Google Gemini)│
          └─────────────────┘
```

---

## Project Structure

```
Envision/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── .gitignore
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   └── architecture.md
├── hardware/
│   ├── esp32_cam/
│   │   ├── esp32_cam.ino        # Arduino firmware for ESP32-CAM
│   │   └── README.md            # Wiring diagrams and flashing guide
│   └── raspberry_pi/
│       ├── main.py              # Python client with OpenCV + Gemini
│       ├── requirements.txt     # Python dependencies
│       └── README.md            # RPi setup and GPIO guide
├── mobile_app/
│   ├── App.js                   # Navigation entry point
│   ├── app.json                 # Expo configuration and permissions
│   ├── package.json             # NPM manifest
│   ├── README.md                # Mobile app setup guide
│   └── src/
│       ├── screens/
│       │   ├── DashboardScreen.js
│       │   ├── CameraOcrScreen.js
│       │   ├── NavigationScreen.js
│       │   ├── VoiceAssistantScreen.js
│       │   └── SettingsScreen.js
│       └── services/
│           ├── bluetoothService.js
│           ├── geminiService.js
│           └── voiceService.js
└── simulator/
    ├── index.html               # Simulator dashboard
    ├── style.css                # Dark theme styles
    ├── app.js                   # Simulator logic and Gemini integration
    └── README.md                # Simulator instructions
```

---

## Hardware Requirements

### ESP32-CAM Build
| Component | Specification |
|---|---|
| Processor | ESP32-CAM (AI-Thinker) with OV2640 camera |
| Proximity Sensor | HC-SR04 Ultrasonic Sensor |
| Alert Output | 5V Active Buzzer or Vibration Motor |
| Level Shifter | 1kΩ + 2kΩ voltage divider for Echo pin |
| Driver Circuit | 2N2222 NPN transistor + 220Ω resistor for buzzer |
| Power | 3.7V Li-ion battery with TP4056 charge controller |
| Programmer | FTDI USB-to-TTL adapter |

### Raspberry Pi Build
| Component | Specification |
|---|---|
| Processor | Raspberry Pi Zero 2 W / Pi 4 / Pi 5 |
| Camera | Pi Camera Module or USB Webcam |
| Proximity Sensor | HC-SR04 Ultrasonic Sensor |
| Alert Output | Active Buzzer on GPIO 27 |
| Trigger Button | Push button on GPIO 17 |

---

## Quick Start

### Web Simulator (No Hardware Required)

The fastest way to explore Envision Glasses is through the web simulator:

```bash
cd simulator
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

The simulator provides:
- Camera viewport with preset scenarios or live webcam
- Ultrasonic proximity slider with audio feedback
- Phone companion app emulator with all screens
- Integrated Gemini AI (add your API key in Settings)

### ESP32-CAM Setup

1. Install the ESP32 Arduino core via Boards Manager
2. Select board: "AI Thinker ESP32-CAM"
3. Connect FTDI programmer (GPIO 0 to GND for flash mode)
4. Upload `hardware/esp32_cam/esp32_cam.ino`
5. Disconnect GPIO 0 from GND, press Reset
6. Connect to Wi-Fi AP: `Envision-Glasses-AP`

### Raspberry Pi Setup

```bash
cd hardware/raspberry_pi
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY="your_api_key_here"
python main.py
```

### Mobile App Setup

```bash
cd mobile_app
npm install
npx expo start
```

Scan the QR code with Expo Go on your smartphone.

---

## AI Integration

Envision Glasses uses **Google Gemini 1.5 Flash** for:

- **OCR**: Extracting and reading text from camera frames
- **Scene Description**: Identifying obstacles and describing environments
- **Voice Assistant**: Answering contextual questions

### Getting an API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a free API key
3. Enter it in the app Settings tab or set as environment variable:
   ```bash
   export GEMINI_API_KEY="your_api_key"
   ```

Without an API key, the system operates in offline demo mode with simulated responses.

---

## Tech Stack

| Module | Technology |
|---|---|
| ESP32 Firmware | C++ (Arduino framework) |
| Raspberry Pi Client | Python, OpenCV, pyttsx3, RPi.GPIO |
| Mobile App | React Native, Expo SDK 50, React Navigation |
| AI Backend | Google Gemini 1.5 Flash (multimodal) |
| Connectivity | Bluetooth Low Energy (BLE), Wi-Fi AP |
| Simulator | HTML5, CSS3, Vanilla JavaScript, Web Audio API |

---

## Contributing

Contributions are welcome. Please fork the repository and create a pull request with your changes.

---

## License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Google Gemini API for multimodal AI capabilities
- ESP32 Arduino community for hardware documentation
- React Native and Expo teams for the mobile framework
- OpenCV for computer vision tools
