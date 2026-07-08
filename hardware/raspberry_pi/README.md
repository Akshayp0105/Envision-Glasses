# Raspberry Pi Client Setup

This directory contains the Python-based Envision Glasses implementation suited for a **Raspberry Pi Zero 2 W**, **Raspberry Pi 4**, or **Raspberry Pi 5** equipped with a camera module or USB Webcam.

---

## 🔌 GPIO Connection Configurations

### 1. Wiring Table

| Component | Pin Name | Raspberry Pi GPIO Pin (BCM) | Physical Header Pin | Notes |
|:---|:---|:---|:---|:---|
| **HC-SR04 Sensor** | VCC | 5V | Physical Pin 2 or 4 | Requires 5V power supply. |
| **HC-SR04 Sensor** | GND | GND | Physical Pin 6 or 9 | Common Ground. |
| **HC-SR04 Sensor** | Trig | `GPIO 23` | Physical Pin 16 | Trigger pin output. |
| **HC-SR04 Sensor** | Echo | `GPIO 24` via Level Shift | Physical Pin 18 | Echo pin (Requires 3.3V reduction). |
| **Push Button** | Pin 1 | `GPIO 17` | Physical Pin 11 | Trigger action button. |
| **Push Button** | Pin 2 | GND | Physical Pin 14 | Pulls pin down to ground when pressed. |
| **Active Buzzer** | (+) | `GPIO 27` (or via transistor) | Physical Pin 13 | High signal triggers audio warning. |
| **Active Buzzer** | (-) | GND | Physical Pin 25 | Ground. |

---

## ⚡ Level Shifter for HC-SR04 Echo Pin (Important)

The Raspberry Pi's GPIO pins are strictly **3.3V tolerant**. The HC-SR04 Echo pin outputs **5V**. You must use a voltage divider to protect the Pi's GPIO:

```
                    1k Ω Resistor
HC-SR04 ECHO ───────[█████]───────────┬───────── Pi GPIO 24 (Physical 18)
                                      │
                                     [ ] 2k Ω Resistor
                                      │
                                     GND (Physical 14)
```

---

## 🔨 Environment Installation

### 1. Enable Camera Support
Run the configuration utility:
```bash
sudo raspi-config
```
Navigate to **Interface Options -> Camera**, enable it, and reboot the system.

### 2. Set Up Virtual Environment & Dependencies
Since modern Raspberry Pi OS releases restrict global pip installations, create a virtual environment:

```bash
# Update package list and install pip/venv/OpenCV pre-requisites
sudo apt update
sudo apt install -y python3-pip python3-venv python3-opencv espeak libespeak1

# Navigate to the RPi project directory
cd Envision/hardware/raspberry_pi

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🚀 Running the Script

1. **Obtain a Google Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/) and create a free API Key.

2. **Configure your API Key on the Pi**:
   ```bash
   export GEMINI_API_KEY="AIzaSyYourKeyHere..."
   ```

3. **Run the script**:
   ```bash
   python main.py
   ```

4. **Interactions**:
   - The camera window will appear on screen.
   - The distance sensor will output proximity alerts dynamically.
   - Press the **SPACEBAR** on your keyboard (with the camera window focused) or click the **physical button** wired to GPIO 17 to capture the camera frame, send it to the Gemini API, and hear the OCR readout.
   - Press **ESC** or **Q** inside the window to exit the application.
