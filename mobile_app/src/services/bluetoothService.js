// Bluetooth Low Energy (BLE) Simulation & Service Manager
class BluetoothService {
  constructor() {
    this.isConnected = false;
    this.deviceName = "Envision-Glasses";
    this.batteryLevel = 85;
    this.distanceCm = 120.0;
    this.listeners = new Set();
    this.searchInterval = null;
    this.telemetryInterval = null;
  }

  // Subscribe to state changes (UI components can re-render when connection or telemetry changes)
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener({
        isConnected: this.isConnected,
        deviceName: this.isConnected ? this.deviceName : "",
        batteryLevel: this.batteryLevel,
        distanceCm: this.distanceCm,
      });
    }
  }

  /**
   * Scan for devices
   * @param {function} onDeviceFound - callback when device found
   */
  startScan(onDeviceFound) {
    console.log("BLE: Scanning started");
    let count = 0;
    
    this.searchInterval = setInterval(() => {
      count++;
      if (count === 2) {
        onDeviceFound({ id: "XX:XX:XX:XX:XX:12", name: "Envision-Glasses-AP" });
      }
      if (count === 4) {
        onDeviceFound({ id: "YY:YY:YY:YY:YY:34", name: "Envision-Glasses" });
        clearInterval(this.searchInterval);
      }
    }, 1000);
  }

  stopScan() {
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
      this.searchInterval = null;
    }
    console.log("BLE: Scanning stopped");
  }

  /**
   * Connect to Envision Glasses
   */
  async connectDevice(deviceId) {
    console.log(`BLE: Connecting to ${deviceId}...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.deviceName = deviceId.includes("12") ? "Envision-Glasses-AP" : "Envision-Glasses";
        this.batteryLevel = 85;
        this.distanceCm = 150.0;
        this.notify();
        this.startTelemetryStream();
        resolve(true);
      }, 1500);
    });
  }

  /**
   * Disconnect from Glasses
   */
  disconnectDevice() {
    console.log("BLE: Disconnecting...");
    this.isConnected = false;
    this.stopTelemetryStream();
    this.notify();
  }

  /**
   * Simulates telemetry data from the ESP32-CAM (HC-SR04 sensor & battery)
   */
  startTelemetryStream() {
    this.stopTelemetryStream();
    this.telemetryInterval = setInterval(() => {
      if (!this.isConnected) return;

      // Simulate a walking pattern (obstacles fluctuating)
      let change = (Math.random() - 0.5) * 30; // Change by up to 15cm
      this.distanceCm = Math.max(10, Math.min(400, this.distanceCm + change));

      // Simulate slow battery drain
      if (Math.random() > 0.95 && this.batteryLevel > 10) {
        this.batteryLevel--;
      }

      this.notify();
    }, 1000);
  }

  stopTelemetryStream() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  // Adjust distance threshold for safety
  getDistance() {
    return this.distanceCm;
  }

  getBattery() {
    return this.batteryLevel;
  }
}

export const bluetoothService = new BluetoothService();
