# ESP32-CAM Hardware Setup & Schematic

This directory contains the firmware for the ESP32-CAM hardware option of the Envision Glasses. Below are the required components, electrical wiring diagrams, and build instructions.

---

## 🔌 Pinout & Schematic Connections

Because the ESP32-CAM module utilizes most of its pins for the OV2640 camera sensor and the microSD card, pin management is crucial. 
This configuration disables SD card storage to free up **GPIO 12, 13, 14, 15, and 2** for sensors and feedback.

### 1. Wiring Table

| Component | Component Pin | ESP32-CAM Pin | Notes |
|:---|:---|:---|:---|
| **Power Input** | VCC (3.7V - 5V) | `5V` (or `3V3`) | Connect to a stable regulated battery source. |
| **Power Input** | GND | `GND` | Common ground. |
| **HC-SR04 Ultrasonic** | VCC | `5V` | Sensor runs best at 5V. |
| **HC-SR04 Ultrasonic** | GND | `GND` | Common ground. |
| **HC-SR04 Ultrasonic** | Trig | `GPIO 13` | Trig output signal from ESP32. |
| **HC-SR04 Ultrasonic** | Echo | `GPIO 12` | Echo input signal (requires 3.3V level shift). |
| **Active Buzzer / Motor** | Positive (+) | `5V` | Sound alert / haptic feedback device. |
| **Active Buzzer / Motor** | Negative (-) | Transistor Collector | Controlled via NPN transistor driver. |
| **NPN Transistor (2N2222)**| Emitter | `GND` | Connects emitter to ground. |
| **NPN Transistor (2N2222)**| Base | `GPIO 14` via 220Ω | 220Ω resistor protects GPIO 14 output pin. |

---

## ⚡ Level Shifter for HC-SR04 Echo Pin

The HC-SR04 echo pin outputs a **5V high signal**, but the ESP32 GPIO pins are only rated for **3.3V max**. Directly connecting the Echo pin to GPIO 12 could damage the ESP32-CAM.
Use a simple voltage divider to drop the voltage from 5V to 3.3V:

```
                  1k Ω Resistor
HC-SR04 ECHO ───────[█████]───────────┬───────── ESP32 GPIO 12
                                      │
                                     [ ] 2k Ω Resistor
                                      │
                                     GND
```

---

## 🏗️ Transistor Switch for Active Buzzer

The ESP32 pins can output at most ~40mA of current, which is insufficient to drive a 5V active buzzer or vibration motor safely. Use a 2N2222 or similar NPN transistor to switch the load:

```
            +5V ───────────────────┬───────────┐
                                   │           │
                                 [Buzzer]    [Diode 1N4007] (optional flyback)
                                   │           │
                                   └─────┬─────┘
                                         │
                                     (Collector)
                  220Ω               c
ESP32 GPIO 14 ───[████]──────── b (Base)  [NPN Transistor]
                                     e
                                 (Emitter)
                                   │
                                  GND
```

---

## 💻 How to Flash the Firmware

Since the ESP32-CAM does not have an onboard USB connector, you must use an **FTDI USB-to-TTL Serial Adapter**:

### FTDI Wiring (only during programming):
- FTDI RX ─── ESP32 TXD (GPIO 1)
- FTDI TX ─── ESP32 RXD (GPIO 3)
- FTDI VCC ── ESP32 5V (Ensure FTDI jumper is set to 5V)
- FTDI GND ── ESP32 GND
- **ESP32 GPIO 0 ── ESP32 GND (Place a jumper here to enter flash mode)**

### Programming Steps:
1. Open the Arduino IDE.
2. Install the ESP32 core via **Tools -> Board -> Boards Manager** (Search for "esp32" by Espressif Systems).
3. Select board: **"AI Thinker ESP32-CAM"**.
4. Set upload speed to **115200**.
5. Connect the FTDI programmer to your computer and select the correct port.
6. Compile and click **Upload**.
7. Once uploading is complete, **disconnect GPIO 0 from GND**.
8. Press the Reset (RST) button on the back of the ESP32-CAM to run the sketch.
9. Open the Serial Monitor at **115200 baud** to see connection statuses and IP address.
