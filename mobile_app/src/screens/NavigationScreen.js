import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { speak, stop } from '../services/voiceService';

// Mock Routes Database
const MOCK_ROUTES = {
  "central park": [
    "Starting route guidance to Central Park. Head North on 5th Avenue.",
    "In 200 meters, turn left onto 59th Street.",
    "Cross the street. Use pedestrian crossing. The walk signal is active.",
    "Turn right. You have arrived at Central Park entrance. The destination is on your right."
  ],
  "pharmacy": [
    "Starting route guidance to CVS Pharmacy. Head South towards Main Street.",
    "Walk 50 meters. In front of you is a curb ramp. Step down carefully.",
    "Turn right. Walk 30 meters. The pharmacy entrance is directly in front of you. Automatic sliding doors ahead."
  ],
  "grocery store": [
    "Starting route guidance to Fresh Foods Grocery. Walk straight for 100 meters.",
    "Obstacle warning: trash bin detected on your left. Keep right.",
    "Turn left at the corner onto Broad Street.",
    "Walk 40 meters. Fresh Foods Grocery is on your left. Door handle is on the right side."
  ]
};

export default function NavigationScreen() {
  const [destination, setDestination] = useState("");
  const [activeRoute, setActiveRoute] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    speak("Navigation assistant ready. Type or speak your destination.");
    return () => stop();
  }, []);

  const handleStartRoute = (target) => {
    const key = target.toLowerCase().trim();
    let steps = MOCK_ROUTES[key];

    if (!steps) {
      // Generate dynamic mock route for generic queries
      steps = [
        `Starting route guidance to ${target || "Destination"}. Walk straight.`,
        "In 150 meters, turn right at the intersection.",
        "Obstacle warning: uneven sidewalk ahead. Proceed slowly.",
        `You have arrived at ${target || "your destination"}.`
      ];
    }

    setActiveRoute(steps);
    setCurrentStep(0);
    speak(steps[0]);
  };

  const handleNextStep = () => {
    if (!activeRoute) return;
    const nextIdx = currentStep + 1;
    if (nextIdx < activeRoute.length) {
      setCurrentStep(nextIdx);
      speak(activeRoute[nextIdx]);
    } else {
      speak("You have arrived. Navigation completed.");
      setActiveRoute(null);
      setDestination("");
    }
  };

  const handleCancelRoute = () => {
    speak("Navigation canceled.");
    setActiveRoute(null);
    setDestination("");
  };

  const handlePresetSelect = (preset) => {
    setDestination(preset);
    handleStartRoute(preset);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Search Input Card */}
      {!activeRoute ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Where would you like to go?</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="search-outline" size={20} color="#a1a1aa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search pharmacy, park, supermarket..."
              placeholderTextColor="#71717a"
              value={destination}
              onChangeText={setDestination}
              onSubmitEditing={() => handleStartRoute(destination)}
            />
          </View>

          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={() => handleStartRoute(destination)}
          >
            <Ionicons name="compass-outline" size={20} color="#fafafa" style={styles.btnIcon} />
            <Text style={styles.btnText}>Start Guidance</Text>
          </TouchableOpacity>
          
          {/* Preset Buttons for easy navigation for visually impaired */}
          <Text style={styles.subtitle}>Suggested Destinations</Text>
          <View style={styles.presetsContainer}>
            <TouchableOpacity style={styles.presetBadge} onPress={() => handlePresetSelect("Pharmacy")}>
              <Ionicons name="medical" size={14} color="#ef4444" />
              <Text style={styles.presetText}>Pharmacy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.presetBadge} onPress={() => handlePresetSelect("Central Park")}>
              <Ionicons name="leaf" size={14} color="#22c55e" />
              <Text style={styles.presetText}>Central Park</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.presetBadge} onPress={() => handlePresetSelect("Grocery Store")}>
              <Ionicons name="cart" size={14} color="#eab308" />
              <Text style={styles.presetText}>Grocery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Active Navigation Route UI */
        <View style={styles.navCard}>
          <View style={styles.navHeader}>
            <View>
              <Text style={styles.navSub}>GUIDANCE ACTIVE</Text>
              <Text style={styles.navTarget}>{destination || "Target Location"}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCancelRoute}>
              <Ionicons name="close-circle" size={28} color="#f43f5e" />
            </TouchableOpacity>
          </View>

          {/* Compass / Directions Arrow Display */}
          <View style={styles.compassContainer}>
            <Ionicons name="arrow-up-circle" size={80} color="#6366f1" style={styles.compassArrow} />
            <Text style={styles.distanceIndicator}>Step {currentStep + 1} of {activeRoute.length}</Text>
          </View>

          {/* Spoken Text Box */}
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>{activeRoute[currentStep]}</Text>
          </View>

          {/* Route Control Buttons */}
          <View style={styles.routeControls}>
            <TouchableOpacity 
              style={[styles.ctrlBtn, styles.ctrlBtnPrev]} 
              disabled={currentStep === 0}
              onPress={() => {
                const prev = currentStep - 1;
                setCurrentStep(prev);
                speak(activeRoute[prev]);
              }}
            >
              <Text style={styles.ctrlBtnTextPrev}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.ctrlBtn, styles.ctrlBtnNext]} 
              onPress={handleNextStep}
            >
              <Text style={styles.ctrlBtnTextNext}>
                {currentStep === activeRoute.length - 1 ? "Finish" : "Next Step"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Safety Notice */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#6366f1" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          Envision Glasses provide orientation assistance. Keep alert of environmental obstacles and obey crossing signals at all times.
        </Text>
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
  cardLabel: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fafafa',
    fontSize: 15,
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  btnIcon: {
    marginRight: 8,
  },
  btnText: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  presetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  presetText: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  navCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  navSub: {
    color: '#6366f1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  navTarget: {
    color: '#fafafa',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    padding: 2,
  },
  compassContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  compassArrow: {
    marginBottom: 10,
  },
  distanceIndicator: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionBox: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3f3f46',
    marginBottom: 20,
  },
  instructionText: {
    color: '#fafafa',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  routeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ctrlBtn: {
    flex: 1,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnPrev: {
    backgroundColor: '#27272a',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  ctrlBtnNext: {
    backgroundColor: '#6366f1',
  },
  ctrlBtnTextPrev: {
    color: '#d4d4d8',
    fontSize: 15,
    fontWeight: '600',
  },
  ctrlBtnTextNext: {
    color: '#fafafa',
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
});
