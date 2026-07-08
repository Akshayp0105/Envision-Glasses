import * as Speech from 'expo-speech';

let speechRate = 1.0;

export const setSpeechRate = (rate) => {
  speechRate = rate;
};

export const getSpeechRate = () => {
  return speechRate;
};

/**
 * Speaks text using the device's native speech engine.
 * @param {string} text - The text to speak.
 * @param {object} options - Expo Speech configurations (optional).
 */
export const speak = (text, options = {}) => {
  if (!text) return;
  
  console.log(`[TTS]: ${text}`);
  
  // Stop any active speech before starting new prompts for real-time responsiveness
  Speech.stop();
  
  Speech.speak(text, {
    rate: speechRate,
    pitch: 1.0,
    language: 'en-US',
    ...options,
  });
};

/**
 * Stops any ongoing speech immediately.
 */
export const stop = () => {
  Speech.stop();
};

/**
 * Checks if speech is currently active.
 * Note: expo-speech isSpeaking is asynchronous.
 */
export const isSpeaking = async () => {
  return await Speech.isSpeakingAsync();
};
