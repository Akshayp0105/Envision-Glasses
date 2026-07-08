// Google Gemini AI Service Bridge
let GEMINI_API_KEY = "";

export const setApiKey = (key) => {
  GEMINI_API_KEY = key;
};

export const getApiKey = () => {
  return GEMINI_API_KEY;
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Ask a voice assistant question to Gemini.
 * @param {string} prompt - User voice query.
 * @returns {Promise<string>} Gemini response text.
 */
export const askAssistant = async (prompt) => {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not configured. Using offline mock responder.");
    return mockAssistantResponse(prompt);
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are the voice assistant for the Envision Glasses, a smart wearable aiding visually impaired individuals. Answer the user's question concisely in 1-2 clear sentences. User says: "${prompt}"`
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      const errorText = await response.text();
      console.error("Gemini API Error details:", errorText);
      return "AI connection error. I'm unable to process that request right now.";
    }
  } catch (error) {
    console.error("Gemini network error:", error);
    return "Connection timeout. Please check your internet connection.";
  }
};

/**
 * Perform Multimodal AI OCR / Scene description on captured frame.
 * @param {string} base64Image - Base64 encoded image string (without data:image/jpeg prefix).
 * @param {string} mode - 'ocr' (read text) or 'describe' (object detection/scene description).
 * @returns {Promise<string>} Descriptive text output to speak.
 */
export const analyzeFrame = async (base64Image, mode = 'ocr') => {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not configured. Using mock visual scan.");
    return mode === 'ocr' 
      ? "OCR Result: 'Danger: Construction Zone. Authorized Personnel Only.'"
      : "Object detected: A black bicycle is parked 2 meters ahead on your left path.";
  }

  const systemInstruction = mode === 'ocr'
    ? "Extract all text readable in this image. Read it aloud exactly. If there's no visible text, say 'No text found.' Keep it under 2 sentences."
    : "Act as real-time audio guidance for a blind person. Describe key obstacles or objects and their approximate direction in front of the user (e.g. 'A blue car parked on the right path'). Do not list details, describe only critical obstacles. Max 2 sentences.";

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemInstruction },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      const errorText = await response.text();
      console.error("Gemini Multimodal Error:", errorText);
      return "Unable to scan. Connection error.";
    }
  } catch (error) {
    console.error("Gemini Multimodal Network Error:", error);
    return "Network error. Failed to analyze scene.";
  }
};

// Conversational offline fallback answers
const mockAssistantResponse = (prompt) => {
  const query = prompt.toLowerCase();
  if (query.includes("time") || query.includes("what time")) {
    return `The current time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  }
  if (query.includes("weather") || query.includes("temperature")) {
    return "It is currently 22 degrees Celsius and partly cloudy.";
  }
  if (query.includes("battery") || query.includes("glasses status")) {
    return "Your Envision Glasses are connected with eighty-five percent battery remaining.";
  }
  if (query.includes("where am i") || query.includes("location")) {
    return "You are currently near 5th Avenue walking heading North.";
  }
  return "I'm running in offline demonstration mode. To get full AI assistant capabilities, please configure your Gemini API Key in the Settings tab.";
};
