/**
 * Envision Glasses - ESP32-CAM Firmware
 * 
 * Hardware Setup:
 * - Board: ESP32 Wrover Module (or AI-Thinker ESP32-CAM)
 * - Sensors:
 *   - HC-SR04 Ultrasonic Sensor (Trig to GPIO 13, Echo to GPIO 12)
 *   - 5V Active Buzzer or Vibration Motor (Signal to GPIO 14 through a NPN transistor)
 *   - OV2640 Camera Module (default AI-Thinker pins)
 * 
 * Functionality:
 * 1. Sets up Wi-Fi Access Point ("Envision-Glasses-AP", password: "envisionglasses")
 * 2. Starts an HTTP server on port 80 to stream MJPEG camera frames
 * 3. Starts BLE Server advertising "Envision-Glasses" for mobile app connectivity
 * 4. Reads ultrasonic sensor data and triggers haptic/audio alerts if distance < 30cm
 * 5. Notifies the mobile app over BLE about real-time obstacle levels and battery status
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <WiFiClient.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Define AI-THINKER ESP32-CAM Pin Mapping
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Sensors and Feedback Pins (Using pins free from camera conflicts)
#define ULTRASONIC_TRIG_PIN 13
#define ULTRASONIC_ECHO_PIN 12
#define BUZZER_PIN          14
#define BATTERY_PIN         33  // Analog input pin to measure battery voltage

// Constants
#define OBSTACLE_THRESHOLD_CM 35.0  // Distance below which buzzer sounds (in cm)
#define STREAM_PART_VAL "123456789000000000000987654321"

// Global Variables
WebServer server(80);
bool deviceConnected = false;
float currentDistanceCm = 100.0;
int batteryPercentage = 85;
unsigned long lastSensorReadTime = 0;
const unsigned long sensorReadInterval = 100; // Read sensors every 100ms

// BLE UUIDs for Companion App Connection
#define SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define DISTANCE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define BATTERY_CHAR_UUID      "2a19" // Standard BLE Battery Level characteristic

BLECharacteristic *pDistanceCharacteristic;
BLECharacteristic *pBatteryCharacteristic;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("BLE Client Connected");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("BLE Client Disconnected");
      // Restart advertising so it can reconnect
      BLEDevice::startAdvertising();
    }
};

// Stream HTTP handler
void handleStream() {
  WiFiClient client = server.client();
  
  // Set response headers for MJPEG stream
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: multipart/x-mixed-replace; boundary=" STREAM_PART_VAL);
  client.println("Access-Control-Allow-Origin: *");
  client.println();

  while (true) {
    if (!client.connected()) break;

    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      delay(100);
      continue;
    }

    client.print("Content-Type: image/jpeg\r\n");
    client.print("Content-Length: " + String(fb->len) + "\r\n\r\n");
    
    // Write frame content
    client.write(fb->buf, fb->len);
    client.print("\r\n--" STREAM_PART_VAL "\r\n");
    
    esp_camera_fb_return(fb);
    
    // Keep a reasonable frame rate
    delay(30);
  }
}

// Handler for root page
void handleRoot() {
  server.send(200, "text/html", "<h1>Envision Glasses active. Camera stream at <a href='/stream'>/stream</a></h1>");
}

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Frame size parameters: SVGA (800x600) is a good balance for streaming and AI OCR processing
  if(psramFound()){
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_CIF;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  
  // Adjust camera parameters for optimal visibility
  sensor_t * s = esp_camera_sensor_get();
  s->set_brightness(s, 1);     // -2 to 2
  s->set_contrast(s, 1);       // -2 to 2
  s->set_saturation(s, 0);     // -2 to 2
  s->set_vflip(s, 0);          // Flip vertically if mounted upside down
  s->set_hmirror(s, 0);        // Mirror horizontally
}

void setupBLE() {
  BLEDevice::init("Envision-Glasses");
  
  // Create Server
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create Obstacle Distance Characteristic
  pDistanceCharacteristic = pService->createCharacteristic(
                              DISTANCE_CHAR_UUID,
                              BLECharacteristic::PROPERTY_READ |
                              BLECharacteristic::PROPERTY_NOTIFY
                            );
  pDistanceCharacteristic->addDescriptor(new BLE2902());

  // Create Battery Characteristic
  pBatteryCharacteristic = pService->createCharacteristic(
                             BATTERY_CHAR_UUID,
                             BLECharacteristic::PROPERTY_READ |
                             BLECharacteristic::PROPERTY_NOTIFY
                           );
  pBatteryCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issues
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("BLE Advertising Started...");
}

float getObstacleDistance() {
  // Clear the trigger pin
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // Sets the trigger pin high for 10 micro seconds
  digitalWrite(ULTRASONIC_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  
  // Reads the echo pin, returns the sound wave travel time in microseconds
  long duration = pulseIn(ULTRASONIC_ECHO_PIN, HIGH, 30000); // 30ms timeout (max ~5 meters)
  
  if (duration == 0) {
    return 999.0; // No obstacle in range or timeout
  }
  
  // Calculating the distance: duration * speed of sound (0.0343 cm/us) / 2
  float distanceCm = duration * 0.0343 / 2.0;
  return distanceCm;
}

int getBatteryLevel() {
  // Read analog value of battery voltage divider
  int rawVal = analogRead(BATTERY_PIN);
  
  // Assuming a voltage divider scaling 4.2V lipo to ESP32 ADC limits (< 3.3V)
  // Maps raw ADC reading (0-4095) to percentage (0-100)
  float voltage = (rawVal / 4095.0) * 3.3 * 2; // Assuming a 1:1 voltage divider
  
  int pct = map(rawVal, 2000, 2900, 0, 100); // Tweak numbers based on battery/divider calibration
  pct = constrain(pct, 0, 100);
  
  return pct;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Starting Envision Glasses Hardware initialization...");

  // Sensor Pins Configuration
  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize Camera
  setupCamera();

  // Setup local WiFi Access Point
  WiFi.softAP("Envision-Glasses-AP", "envisionglasses");
  IPAddress IP = WiFi.softAPIP();
  Serial.print("WiFi AP Created. SSID: Envision-Glasses-AP, IP address: ");
  Serial.println(IP);

  // Start HTTP Server
  server.on("/", handleRoot);
  server.on("/stream", handleStream);
  server.begin();
  Serial.println("HTTP Video Server started.");

  // Initialize BLE
  setupBLE();
  
  Serial.println("Hardware initialized successfully.");
}

void loop() {
  server.handleClient();
  
  unsigned long currentMillis = millis();
  
  // Run sensor readings periodically
  if (currentMillis - lastSensorReadTime >= sensorReadInterval) {
    lastSensorReadTime = currentMillis;
    
    // Read sensors
    currentDistanceCm = getObstacleDistance();
    batteryPercentage = getBatteryLevel();
    
    // Safety Feedback: Trigger buzzer if distance is below threshold
    if (currentDistanceCm < OBSTACLE_THRESHOLD_CM) {
      // Dynamic beep frequency based on distance
      int alertToneDuration = map(currentDistanceCm, 5, OBSTACLE_THRESHOLD_CM, 30, 200);
      alertToneDuration = constrain(alertToneDuration, 20, 250);
      
      digitalWrite(BUZZER_PIN, HIGH);
      delay(alertToneDuration);
      digitalWrite(BUZZER_PIN, LOW);
      
      Serial.printf("ALERT: Obstacle detected at %.2f cm!\n", currentDistanceCm);
    }
    
    // Update BLE values if a device is connected
    if (deviceConnected) {
      // Send distance over BLE
      char distStr[10];
      dtostrf(currentDistanceCm, 4, 1, distStr);
      pDistanceCharacteristic->setValue(distStr);
      pDistanceCharacteristic->notify();
      
      // Send battery level over BLE
      uint8_t battVal = batteryPercentage;
      pBatteryCharacteristic->setValue(&battVal, 1);
      pBatteryCharacteristic->notify();
    }
  }
}
