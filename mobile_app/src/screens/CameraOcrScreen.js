import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import { analyzeFrame } from '../services/geminiService';
import { speak, stop } from '../services/voiceService';

export default function CameraOcrScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraMode, setCameraMode] = useState('ocr'); // 'ocr' or 'describe'
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultText, setResultText] = useState("");
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Speak initial guide
    speak("Camera reader open. Double tap the screen to scan, or toggle between text mode and object mode.");
    
    return () => {
      stop();
    };
  }, []);

  const toggleMode = () => {
    const nextMode = cameraMode === 'ocr' ? 'describe' : 'ocr';
    setCameraMode(nextMode);
    speak(nextMode === 'ocr' ? "Switching to text reading mode." : "Switching to object detection mode.");
    setResultText("");
  };

  const handleCaptureAndAnalyze = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setResultText("Analyzing...");
      speak(cameraMode === 'ocr' ? "Scanning text, please hold steady." : "Scanning environment, please hold steady.");

      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const photo = await cameraRef.current.takePictureAsync(options);
      
      // Analyze base64 image with Gemini
      const analysisResult = await analyzeFrame(photo.base64, cameraMode);
      
      setResultText(analysisResult);
      speak(analysisResult);
    } catch (error) {
      console.error("Camera scan failed:", error);
      setResultText("Scan failed. Please try again.");
      speak("Sorry, I could not complete the scan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.promptText}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Ionicons name="eye-off-outline" size={48} color="#ef4444" />
        <Text style={styles.promptText}>Camera permission was denied.</Text>
        <Text style={styles.subPromptText}>Please enable camera access in settings to use OCR and Vision analysis features.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live Camera Viewport */}
      <Camera style={styles.camera} ref={cameraRef}>
        <View style={styles.overlayContainer}>
          {/* Target Reticle */}
          <View style={[styles.reticle, { borderColor: cameraMode === 'ocr' ? '#6366f1' : '#22c55e' }]} />
          
          <Text style={styles.cameraGuide}>
            {cameraMode === 'ocr' ? "Align text within frame" : "Point glasses towards obstacles"}
          </Text>
        </View>
      </Camera>

      {/* Control Panel Card */}
      <View style={styles.controlPanel}>
        <View style={styles.modeToggleRow}>
          <TouchableOpacity 
            style={[styles.modeBtn, cameraMode === 'ocr' && styles.modeBtnActive]} 
            onPress={() => { if(cameraMode !== 'ocr') toggleMode(); }}
          >
            <Ionicons name="document-text" size={20} color={cameraMode === 'ocr' ? '#fafafa' : '#a1a1aa'} />
            <Text style={[styles.modeBtnText, cameraMode === 'ocr' && styles.modeBtnTextActive]}>Text OCR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeBtn, cameraMode === 'describe' && styles.modeBtnActive]} 
            onPress={() => { if(cameraMode !== 'describe') toggleMode(); }}
          >
            <Ionicons name="shapes" size={20} color={cameraMode === 'describe' ? '#fafafa' : '#a1a1aa'} />
            <Text style={[styles.modeBtnText, cameraMode === 'describe' && styles.modeBtnTextActive]}>Objects</Text>
          </TouchableOpacity>
        </View>

        {/* Scan Trigger Button */}
        <TouchableOpacity 
          style={[styles.scanBtn, { backgroundColor: cameraMode === 'ocr' ? '#6366f1' : '#22c55e' }]}
          onPress={handleCaptureAndAnalyze}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fafafa" />
          ) : (
            <>
              <Ionicons name="scan-circle" size={24} color="#fafafa" style={styles.btnIcon} />
              <Text style={styles.scanBtnText}>Scan Viewport</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results Box */}
        {resultText !== "" && (
          <View style={styles.resultBox}>
            <Text style={styles.resultHeader}>Scan Output:</Text>
            <Text style={styles.resultBody}>{resultText}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
    padding: 20,
  },
  promptText: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 14,
    textAlign: 'center',
  },
  subPromptText: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticle: {
    width: 260,
    height: 260,
    borderRadius: 20,
    borderWidth: 3,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 20,
  },
  cameraGuide: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(9, 9, 11, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  controlPanel: {
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    padding: 20,
    paddingBottom: 25,
  },
  modeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: '#3f3f46',
  },
  modeBtnText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  modeBtnTextActive: {
    color: '#fafafa',
  },
  scanBtn: {
    borderRadius: 12,
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 8,
  },
  scanBtnText: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '700',
  },
  resultBox: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  resultHeader: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  resultBody: {
    color: '#fafafa',
    fontSize: 14,
    lineHeight: 20,
  },
});
