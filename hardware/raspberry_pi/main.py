"""
Envision Glasses - Raspberry Pi Client

Functionality:
1. Captures live camera frames using OpenCV.
2. Reads distance from an HC-SR04 ultrasonic sensor (using RPi.GPIO or mock fallback).
3. Local haptic/audio alerts: plays sound warnings when an obstacle is close.
4. Button-triggered OCR and AI Assistant:
   - Captures current frame and sends it to the Gemini API to extract text or describe the environment.
   - Speaks text aloud using pyttsx3 offline text-to-speech engine.
"""

import os
import sys
import time
import threading
import cv2
import pyttsx3
import requests

# Try to import RPi.GPIO (Raspberry Pi specific)
try:
    import RPi.GPIO as GPIO
    HAS_GPIO = True
except ImportError:
    HAS_GPIO = False
    print("RPi.GPIO not found. Running in SIMULATION mode for GPIO sensors.")

# Configuration
ULTRASONIC_TRIG = 23
ULTRASONIC_ECHO = 24
BUTTON_PIN = 17
BUZZER_PIN = 27
OBSTACLE_THRESHOLD_CM = 40.0

# Gemini API configuration
# To use, set environmental variable: export GEMINI_API_KEY="your_api_key"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

# Initialize TTS Engine
try:
    tts_engine = pyttsx3.init()
    # Adjust properties
    tts_engine.setProperty('rate', 160)     # Speed of speech (words per minute)
    tts_engine.setProperty('volume', 1.0)   # Volume level (0.0 to 1.0)
except Exception as e:
    tts_engine = None
    print(f"Failed to initialize TTS engine: {e}")

# Thread safe TTS speaking queue
tts_lock = threading.Lock()

def speak(text):
    print(f"[TTS Out]: {text}")
    if tts_engine:
        def _speak():
            with tts_lock:
                tts_engine.say(text)
                tts_engine.runAndWait()
        threading.Thread(target=_speak, daemon=True).start()

# Initialize GPIO
if HAS_GPIO:
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(ULTRASONIC_TRIG, GPIO.OUT)
    GPIO.setup(ULTRASONIC_ECHO, GPIO.IN)
    GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(BUZZER_PIN, GPIO.OUT)
    GPIO.output(BUZZER_PIN, GPIO.LOW)

def get_distance():
    if not HAS_GPIO:
        # Simulated distance pattern (fluctuates safely)
        return 150.0 - (time.time() % 30) * 4.0

    # Read distance from HC-SR04
    GPIO.output(ULTRASONIC_TRIG, GPIO.LOW)
    time.sleep(0.000002)
    
    GPIO.output(ULTRASONIC_TRIG, GPIO.HIGH)
    time.sleep(0.00001)
    GPIO.output(ULTRASONIC_TRIG, GPIO.LOW)

    pulse_start = time.time()
    pulse_end = time.time()
    
    timeout = time.time() + 0.05
    while GPIO.input(ULTRASONIC_ECHO) == 0:
        pulse_start = time.time()
        if pulse_start > timeout:
            return 999.0

    timeout = time.time() + 0.05
    while GPIO.input(ULTRASONIC_ECHO) == 1:
        pulse_end = time.time()
        if pulse_end > timeout:
            return 999.0

    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 17150
    return round(distance, 1)

def trigger_buzzer(duration=0.1):
    if HAS_GPIO:
        GPIO.output(BUZZER_PIN, GPIO.HIGH)
        time.sleep(duration)
        GPIO.output(BUZZER_PIN, GPIO.LOW)
    else:
        print("\a", end="", flush=True) # ASCII Bell sound on console

def perform_ai_ocr(image_frame):
    if not GEMINI_API_KEY:
        speak("Gemini API key is not configured. Simulating OCR: 'Reading sign ahead. Yield for pedestrian crossing.'")
        return

    print("Uploading frame to Gemini API for processing...")
    speak("Processing scene, please hold steady.")
    
    # Encode image frame to JPEG
    success, encoded_image = cv2.imencode('.jpg', image_frame)
    if not success:
        speak("Failed to process image frame.")
        return
        
    image_bytes = encoded_image.tobytes()

    # Prepare Gemini API payload
    import base64
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}
    
    payload = {
        "contents": [{
            "parts": [
                {"text": "Extract all text readable in this image. If there is a sign, read it aloud. If there are objects, list key obstacles in front of me. Keep the response very concise for audio readout (maximum 2 sentences)."},
                {
                    "inlineData": {
                        "mimeType": "image/jpeg",
                        "data": base64_image
                    }
                }
            ]
        }]
    }

    try:
        response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=payload, timeout=15)
        if response.status_code == 200:
            res_json = response.json()
            description = res_json['candidates'][0]['content']['parts'][0]['text']
            speak(description.strip())
        else:
            print(f"Gemini API Error: {response.status_code} - {response.text}")
            speak("AI connection error. Unable to analyze scene.")
    except Exception as e:
        print(f"Network error in AI analysis: {e}")
        speak("Connection timeout. Please check your internet connection.")

def main():
    speak("Envision Glasses system starting.")
    
    # Validate Gemini API key
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY not set. OCR will use simulated responses.")
        print("Set it with: export GEMINI_API_KEY='your_key_here'")
    
    # Open camera stream
    camera_index = 0
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print("Error: Could not open camera source.")
        speak("Warning: Camera module not found.")
        sys.exit(1)
        
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print("Camera running. Press SPACE in the GUI window or trigger GPIO Button to capture AI OCR.")
    speak("System is ready.")
    
    last_speak_time = 0
    last_btn_state = 1
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame.")
                time.sleep(0.1)
                continue

            # Read proximity sensor
            distance = get_distance()
            
            # Obstacle Alert logic
            if distance < OBSTACLE_THRESHOLD_CM:
                current_time = time.time()
                # sound buzzer
                trigger_buzzer(0.08)
                # Verbose warning every 3 seconds to avoid spamming TTS
                if current_time - last_speak_time > 3.0:
                    speak(f"Alert. Obstacle {int(distance)} centimeters ahead.")
                    last_speak_time = current_time

            # Show video window (useful for debugging on desktop/RPi display)
            cv2.putText(frame, f"Dist: {distance:.1f} cm", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255) if distance < OBSTACLE_THRESHOLD_CM else (0, 255, 0), 2)
            cv2.imshow("Envision Glasses Stream", frame)
            
            # Read physical Button (Active Low with pull-up resistor)
            btn_pressed = False
            if HAS_GPIO:
                btn_state = GPIO.input(BUTTON_PIN)
                if btn_state == 0 and last_btn_state == 1: # Transition High -> Low (press)
                    btn_pressed = True
                last_btn_state = btn_state

            # Handle Keyboard Input inside OpenCV Window
            key = cv2.waitKey(1) & 0xFF
            if key == ord(' ') or btn_pressed: # SPACE bar or physical button
                # Run OCR task in a background thread to prevent GUI lagging
                threading.Thread(target=perform_ai_ocr, args=(frame.copy(),), daemon=True).start()
            elif key == 27 or key == ord('q'): # ESC or Q to quit
                break
                
            time.sleep(0.03) # Cap loop rate to ~30 FPS

    except KeyboardInterrupt:
        print("Exiting Envision Glasses Raspberry Pi client...")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        if HAS_GPIO:
            GPIO.cleanup()
        speak("System shutting down.")

if __name__ == "__main__":
    main()
