# System Architecture

This document provides a detailed overview of the Envision Glasses system architecture, data flow, and component interactions.

## System Overview

Envision Glasses operates as a distributed system across three tiers:

1. **Edge Device** (ESP32-CAM or Raspberry Pi) — Sensors, camera, local alerts
2. **Mobile Companion** (React Native App) — UI, BLE bridge, AI orchestration
3. **Cloud Backend** (Google Gemini API) — OCR, scene understanding, conversational AI

## Data Flow

### Proximity Sensing (Real-time, <100ms)

```
HC-SR04 Sensor
    │
    ▼
ESP32-CAM (GPIO 12/13)
    │
    ├──► Local Buzzer (GPIO 14) — Immediate haptic feedback
    │
    └──► BLE Notify ──► Mobile App ──► TTS Voice Alert
```

The ultrasonic sensor reads distance every 100ms. If below threshold (35cm), the buzzer triggers locally. Simultaneously, the distance value is sent over BLE to the mobile app, which can provide additional voice guidance.

### Camera OCR Pipeline (~2-3s latency)

```
User Presses Button
    │
    ▼
ESP32-CAM captures JPEG frame
    │
    ▼
MJPEG Stream ──► Mobile App ──► Base64 Encode
    │
    ▼
Google Gemini API (Multimodal)
    │
    ▼
Text Response ──► TTS Engine ──► Audio Output
```

### Voice Assistant Flow

```
User Voice/Text Input
    │
    ▼
Mobile App ──► Gemini Text API
    │
    ▼
Response Text ──► TTS ──► Speaker
```

## BLE Communication Protocol

### Service UUID
`4fafc201-1fb5-459e-8fcc-c5c9c331914b`

### Characteristics

| Characteristic | UUID | Properties | Description |
|---|---|---|---|
| Distance | `beb5483e-36e1-4688-b7f5-ea07361b26a8` | Read, Notify | Obstacle distance in cm (string) |
| Battery | `2a19` | Read, Notify | Battery percentage (0-100, uint8) |

### Connection Flow
1. Mobile app scans for BLE devices
2. Filters for "Envision-Glasses" advertisement
3. Connects and subscribes to Distance and Battery characteristics
4. Receives notifications every 100ms when sensors are active

## Wi-Fi AP Mode

The ESP32-CAM creates a local Wi-Fi access point for camera streaming:

- **SSID**: `Envision-Glasses-AP`
- **Password**: `envisionglasses`
- **IP**: `192.168.4.1` (default AP mode)
- **Port**: 80 (HTTP)

### Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Status page with link to stream |
| `/stream` | GET | MJPEG camera stream |
| `/update` | POST | OTA firmware update |
| `/ota-status` | GET | Firmware version info |

## Mobile App Navigation

```
App.js (Tab Navigator)
    │
    ├── DashboardScreen
    │   ├── BLE Connection Manager
    │   ├── Telemetry HUD
    │   └── Quick Action Grid
    │
    ├── CameraOcrScreen
    │   ├── Camera Viewport
    │   ├── Mode Toggle (OCR/Describe)
    │   └── Scan Results Panel
    │
    ├── NavigationScreen
    │   ├── Destination Search
    │   ├── Preset Buttons
    │   └── Active Route Guidance
    │
    ├── VoiceAssistantScreen
    │   ├── Media Player Widget
    │   ├── Chat History
    │   └── Voice Input
    │
    └── SettingsScreen
        ├── API Key Manager
        ├── Speech Rate Control
        └── Sensor Calibration
```

## Security Considerations

- Camera streams are local Wi-Fi only (not internet-exposed)
- API keys stored in device-local storage
- BLE communication is unencrypted (future: BLE 4.2+ encryption)
- All Gemini API calls use HTTPS

## Power Management

### ESP32-CAM
- Active mode: ~180mA (camera + Wi-Fi + BLE)
- Idle mode: ~50mA (BLE only, camera off)
- Battery life estimate: 4-6 hours with 1000mAh LiPo

### Raspberry Pi
- Active mode: ~500mA (camera + GPIO)
- Battery life estimate: 3-5 hours with 3000mAh battery pack
