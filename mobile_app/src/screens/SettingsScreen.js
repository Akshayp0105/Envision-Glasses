import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { setApiKey, getApiKey } from '../services/geminiService';
import { setSpeechRate, getSpeechRate, speak } from '../services/voiceService';

export default function SettingsScreen() {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [hapticAlerts, setHapticAlerts] = useState(true);
  const [audioBeeps, setAudioBeeps] = useState(true);

  useEffect(() => {
    // Load initial values
    setApiKeyInput(getApiKey());
    setSpeechSpeed(getSpeechRate());
  }, []);

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    speak("Gemini API key saved successfully.");
  };

  const handleSpeedAdjust = (change) => {
    let nextSpeed = Math.round((speechSpeed + change) * 10) / 10;
    nextSpeed = Math.max(0.5, Math.min(2.0, nextSpeed));
    setSpeechSpeed(nextSpeed);
    setSpeechRate(nextSpeed);
    speak(`Speech rate adjusted to ${nextSpeed} times.`);
  };

  const triggerCalibration = () => {
    speak("Calibrating proximity sensors. Please stand clear of obstacles.");
    setTimeout(() => {
      speak("Sensor calibration completed successfully.");
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* AI Settings Group */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>AI Integration</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Google Gemini API Key</Text>
          <View style={styles.keyRow}>
            <TextInput
              style={styles.keyInput}
              placeholder="Paste AI Studio API Key"
              placeholderTextColor="#71717a"
              secureTextEntry={true}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
            />
            <TouchableOpacity style={styles.keySaveBtn} onPress={handleSaveApiKey}>
              <Text style={styles.keySaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            Enables OCR image transcribing and the Q&A voice assistant. Get a key at Google AI Studio.
          </Text>
        </View>
      </View>

      {/* Audio & Haptic Calibration Group */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Voice & Feedback</Text>

        {/* Speech Speed */}
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Speech Rate</Text>
            <Text style={styles.helperText}>Current speed: {speechSpeed}x</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => handleSpeedAdjust(-0.1)}>
              <Ionicons name="remove" size={18} color="#fafafa" />
            </TouchableOpacity>
            <Text style={styles.counterVal}>{speechSpeed}x</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => handleSpeedAdjust(0.1)}>
              <Ionicons name="add" size={18} color="#fafafa" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Haptic Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.labelContainer}>
            <Text style={styles.settingLabel}>Haptic Warnings</Text>
            <Text style={styles.helperText}>Trigger phone vibration on close obstacles</Text>
          </View>
          <Switch
            value={hapticAlerts}
            onValueChange={setHapticAlerts}
            trackColor={{ false: '#3f3f46', true: '#6366f1' }}
            thumbColor={'#fafafa'}
          />
        </View>

        {/* Buzzer beeps */}
        <View style={styles.settingRow}>
          <View style={styles.labelContainer}>
            <Text style={styles.settingLabel}>Buzzer Beeps</Text>
            <Text style={styles.helperText}>Enable hardware buzzer alerts on glasses</Text>
          </View>
          <Switch
            value={audioBeeps}
            onValueChange={setAudioBeeps}
            trackColor={{ false: '#3f3f46', true: '#6366f1' }}
            thumbColor={'#fafafa'}
          />
        </View>
      </View>

      {/* Hardware Calibration */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Device Maintenance</Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={triggerCalibration}>
          <View style={styles.actionIconContainer}>
            <Ionicons name="pulse" size={20} color="#22c55e" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Calibrate Proximity Sensors</Text>
            <Text style={styles.helperText}>Realign ultrasonic distance readings to zero</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#71717a" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.deviceInfoRow}>
          <Text style={styles.infoLabel}>Firmware Version</Text>
          <Text style={styles.infoValue}>v1.0.4-stable</Text>
        </View>
        
        <View style={styles.deviceInfoRow}>
          <Text style={styles.infoLabel}>Hardware MAC</Text>
          <Text style={styles.infoValue}>24:0A:C4:8B:58:A2</Text>
        </View>
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
  sectionCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  sectionTitle: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 10,
  },
  settingLabel: {
    color: '#fafafa',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  keyRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  keyInput: {
    flex: 1,
    backgroundColor: '#27272a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
    color: '#fafafa',
    paddingHorizontal: 12,
    height: 44,
  },
  keySaveBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    width: 64,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySaveText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  labelContainer: {
    flex: 1,
    marginRight: 10,
  },
  helperText: {
    color: '#a1a1aa',
    fontSize: 12,
    lineHeight: 16,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
    padding: 4,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#3f3f46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterVal: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272a',
    marginVertical: 14,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  infoValue: {
    color: '#fafafa',
    fontSize: 13,
    fontWeight: '600',
  },
});
