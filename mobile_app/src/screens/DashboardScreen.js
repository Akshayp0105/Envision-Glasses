import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { bluetoothService } from '../services/bluetoothService';
import { speak } from '../services/voiceService';

export default function DashboardScreen({ navigation }) {
  const [deviceState, setDeviceState] = useState({
    isConnected: false,
    deviceName: "",
    batteryLevel: 100,
    distanceCm: 200,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);

  useEffect(() => {
    // Subscribe to bluetooth state changes
    const unsubscribe = bluetoothService.subscribe((state) => {
      setDeviceState(state);
      
      // Automatic safety voice alert if distance becomes too close (< 50cm)
      if (state.isConnected && state.distanceCm < 50) {
        speak("Warning. Obstacle within fifty centimeters.");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnectToggle = () => {
    if (deviceState.isConnected) {
      bluetoothService.disconnectDevice();
      speak("Glasses disconnected.");
    } else {
      setIsScanning(true);
      setFoundDevices([]);
      speak("Scanning for envision glasses.");
      
      bluetoothService.startScan((device) => {
        setFoundDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      });

      // Stop scanning after 5s and connect to the best one automatically for demonstration
      setTimeout(async () => {
        bluetoothService.stopScan();
        setIsScanning(false);
        speak("Glasses found. Connecting.");
        await bluetoothService.connectDevice("XX:XX:XX:XX:XX:34");
        speak("Glasses connected successfully. Proximity sensors active.");
      }, 5000);
    }
  };

  const getDistanceColor = (dist) => {
    if (dist < 50) return '#ef4444'; // Red
    if (dist < 120) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Device Connection Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Hardware Status</Text>
          <Ionicons 
            name={deviceState.isConnected ? "bluetooth" : "bluetooth-outline"} 
            size={24} 
            color={deviceState.isConnected ? "#6366f1" : "#a1a1aa"} 
          />
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: deviceState.isConnected ? "#22c55e" : "#ef4444" }]} />
          <Text style={styles.statusText}>
            {deviceState.isConnected 
              ? `Connected to ${deviceState.deviceName}` 
              : isScanning 
                ? "Scanning for Envision Glasses..." 
                : "No glasses paired"}
          </Text>
        </View>

        {deviceState.isConnected && (
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryItem}>
              <Ionicons name="battery-charging-outline" size={20} color="#22c55e" />
              <Text style={styles.telemetryValue}>{deviceState.batteryLevel}%</Text>
              <Text style={styles.telemetryLabel}>Glasses Battery</Text>
            </View>
            <View style={styles.telemetryItem}>
              <Ionicons name="resize-outline" size={20} color="#6366f1" />
              <Text style={styles.telemetryValue}>{Math.round(deviceState.distanceCm)} cm</Text>
              <Text style={styles.telemetryLabel}>Proximity Sensor</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.btn, deviceState.isConnected ? styles.btnDanger : styles.btnPrimary]} 
          onPress={handleConnectToggle}
          disabled={isScanning}
        >
          <Text style={styles.btnText}>
            {deviceState.isConnected 
              ? "Disconnect Device" 
              : isScanning 
                ? "Searching..." 
                : "Search and Connect"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Obstacle Distance Warning Banner */}
      {deviceState.isConnected && deviceState.distanceCm < 80 && (
        <View style={[styles.alertBanner, { borderColor: getDistanceColor(deviceState.distanceCm) }]}>
          <Ionicons name="warning" size={28} color="#ef4444" style={styles.alertIcon} />
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>CRITICAL OBSTACLE AHEAD</Text>
            <Text style={styles.alertDesc}>
              Distance: {Math.round(deviceState.distanceCm)} cm. Please slow down and adjust your path.
            </Text>
          </View>
        </View>
      )}

      {/* Grid Quick Shortcuts */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Vision')}>
          <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="eye" size={28} color="#6366f1" />
          </View>
          <Text style={styles.gridCardTitle}>OCR Reader</Text>
          <Text style={styles.gridCardDesc}>Scan and read text aloud</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Navigate')}>
          <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
            <Ionicons name="navigate" size={28} color="#22c55e" />
          </View>
          <Text style={styles.gridCardTitle}>Get Directions</Text>
          <Text style={styles.gridCardDesc}>Voice-guided navigation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Assistant')}>
          <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
            <Ionicons name="mic" size={28} color="#ec4899" />
          </View>
          <Text style={styles.gridCardTitle}>AI Assistant</Text>
          <Text style={styles.gridCardDesc}>Ask questions via voice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={() => { speak("Envision Glasses companion application active. All systems normal."); }}>
          <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
            <Ionicons name="volume-high" size={28} color="#eab308" />
          </View>
          <Text style={styles.gridCardTitle}>Audio Status</Text>
          <Text style={styles.gridCardDesc}>Replay voice diagnostic</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    color: '#e4e4e7',
    fontSize: 15,
    fontWeight: '500',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 12,
  },
  telemetryItem: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryValue: {
    color: '#fafafa',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  telemetryLabel: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
  },
  btnDanger: {
    backgroundColor: '#3f3f46',
  },
  btnText: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#1c1917',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: 14,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  alertDesc: {
    color: '#d6d3d1',
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  sectionHeader: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    color: '#fafafa',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridCardDesc: {
    color: '#a1a1aa',
    fontSize: 12,
    lineHeight: 16,
  },
});
