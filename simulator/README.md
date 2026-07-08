# Envision Glasses - Interactive Web Simulator

The **Interactive Web Simulator** is a standalone, web-based demonstration client designed to showcase and test the complete Envision Glasses ecosystem instantly in any standard desktop browser, without requiring compilation tools, ESP32 hardware, or mobile emulators.

---

## 🌟 Key Features of the Simulator

1. **Hardware Viewport Simulator**:
   - Select preset environments ("Pedestrian Street Crossing", "Reading Book Pages", "Pill Bottle Instructions", "Construction Warning Sign") OR stream your local webcam feed.
   - Adjust an ultrasonic range slider to simulate walk proximity and hear warning beeps synthesized via the browser's Web Audio API.
   - Press the frame click button on the glasses to snap photos and invoke the OCR scan.

2. **Phone Emulator (Companion App)**:
   - **Dashboard**: Displays live BLE pairing toggles, battery life indicators, and collision alarm flags.
   - **AI Vision (OCR/Object Scanner)**: Snaps the current viewport (whether webcam snapshot or preset scene) and speaks the transcribing results aloud using browser Text-to-Speech (TTS).
   - **Route Navigation**: Select destination targets (Pharmacy, Central Park, etc.) and walk step-by-step with spoken voice guides.
   - **Voice Assistant**: Type questions or double-tap the touchpad (microphone) to ask queries.
   - **Media Hub**: Integrated audio player controls for track playback.
   - **Settings Panel**: Adjust speech speed or paste your Google Gemini API Key to enable real API responses.

---

## 🚀 How to Run the Simulator

Because the simulator uses standard client-side technologies (HTML, CSS, and Vanilla JavaScript), running it is simple.

### Option A: Double-Click (Offline Launch)
1. Open the project root folder in your File Explorer.
2. Navigate to `Envision/simulator/`.
3. Double-click the `index.html` file to open it in Google Chrome, Microsoft Edge, or Mozilla Firefox.

### Option B: Local Web Server (For Webcam support)
Because browser security contexts restrict camera access on local filesystem paths (`file://`), you **must** host the files via a local HTTP server to test the webcam stream capability:

```bash
# Using Python (Built-in)
cd Envision/simulator
python -m http.server 8000

# Using Node (NPM)
cd Envision/simulator
npx serve ./
```

Open your browser and navigate to `http://localhost:8000` (or the port specified by the terminal console).
