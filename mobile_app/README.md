# Companion Mobile App - Setup & Instructions

This directory contains the React Native/Expo project for the companion app of the **Envision Glasses**.

---

## 🛠️ Stack & Libraries
- **Platform Core**: [Expo (SDK 50)](https://expo.dev/) & React Native.
- **Routing & Navigation**: React Navigation (Bottom Tabs Stack).
- **Text-to-Speech (TTS)**: `expo-speech` (native platform engine).
- **Icons**: `@expo/vector-icons` (Ionicons pack).

---

## 📂 Code Layout
```
mobile_app/
├── package.json         # NPM manifest & script configurations
├── app.json             # Expo project permissions (Camera, Microphone, BLE)
├── App.js               # Application Entrypoint (Navigation setup)
└── src/
    ├── screens/
    │   ├── DashboardScreen.js      # BLE connection status, battery, live sensor alerts
    │   ├── CameraOcrScreen.js      # Multimodal AI scanning (Text OCR / Object Descriptions)
    │   ├── NavigationScreen.js     # Voice-guided walking route director
    │   ├── VoiceAssistantScreen.js # Voice conversational Q&A & Media controls
    │   └── SettingsScreen.js       # Adjust speech rate, calibrate sensors, save API keys
    └── services/
        ├── bluetoothService.js     # BLE pairing & telemetry streams (proximity alerts)
        ├── geminiService.js        # Google Gemini Flash API connector (multimodal)
        └── voiceService.js         # Spoken audio synthesiser configurations
```

---

## 🏃 Getting Started & Running

You can run the application on your physical smartphone using **Expo Go** or compile it to run directly in your web browser.

### 1. Installation
Navigate to the mobile directory and install all node packages:
```bash
cd Envision/mobile_app
npm install
```

### 2. Start the Development Server
```bash
# Starts the Metro Bundler
npx expo start
```

### 3. Run on Mobile Phone (Highly Recommended)
- Download the free **Expo Go** app from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [Apple App Store](https://apps.apple.com/us/app/expo-go/id984023788).
- Scan the **QR Code** displayed in your command line window using:
  - **Android**: Scan via the Expo Go app.
  - **iOS**: Scan via the default Camera app.
- Make sure your computer and smartphone are connected to the **same Wi-Fi network**.

### 4. Run in Browser (Web view)
To preview the app directly in your desktop browser:
```bash
# Launch in default browser
npm run web
```

---

## 🤖 Configuring the Gemini AI Engine
To utilize OCR, Scene descriptions, and the Conversational voice assistant:
1. Obtain an API Key at [Google AI Studio](https://aistudio.google.com/).
2. Open the Envision Glasses App.
3. Navigate to the **Settings** tab.
4. Paste your key in the **Google Gemini API Key** input field and click **Save**.
5. The assistant will now provide live responses instead of simulated fallbacks!
