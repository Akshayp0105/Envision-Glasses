// Envision Glasses - Interactive Web Simulator Logic

// Global Configuration
let config = {
  isConnected: true,
  batteryLevel: 85,
  distanceCm: 120,
  visionMode: 'ocr', // 'ocr' or 'describe'
  speechRate: 1.0,
  hapticEnabled: true,
  buzzerEnabled: true,
  geminiApiKey: localStorage.getItem('envision_gemini_key') || '',
  isWebcamActive: false,
};

// Scenario Database
const SCENARIOS = {
  street: {
    title: "Pedestrian Street Crossing",
    desc: "A standard crosswalk environment with pedestrian walkways and traffic lights.",
    ocr: "Walk Signal Active. Cross with caution.",
    describe: "I see a crosswalk ahead. The pedestrian light is green, and vehicles on the road have stopped."
  },
  book: {
    title: "Reading Book Pages",
    desc: "A printed text page from a book or reference document.",
    ocr: "Chapter 2. The Journey of Independence. True accessibility is not a favor, it is a human right.",
    describe: "A printed page with two columns of dark ink text on white paper."
  },
  medicine: {
    title: "Pill Bottle Instructions",
    desc: "A prescription container with usage dosage details.",
    ocr: "Dosage: Take one capsule every 12 hours with meals. Count: 30 remaining.",
    describe: "An orange cylindrical medicine container with a white childproof safety cap."
  },
  construction: {
    title: "Construction Warning Sign",
    desc: "A high-visibility barrier warning pedestrians of path blockages.",
    ocr: "DANGER. Sidewalk Closed. Detour Ahead.",
    describe: "A yellow diamond construction barricade is blockading the pavement directly ahead."
  }
};

// Mock Navigation Routes
const NAV_ROUTES = {
  "Pharmacy": [
    "Starting route to CVS Pharmacy. Head North on 5th Avenue.",
    "Walk 100 meters. Alert: low hanging tree branch detected on your right.",
    "In 20 meters, turn right on 59th street.",
    "Walk 50 meters. The pharmacy entrance is directly in front of you. Automatic sliding doors ahead."
  ],
  "Central Park": [
    "Starting route to Central Park. Head West on 60th street.",
    "Walk 80 meters. In front of you is a curb ramp. Step down carefully.",
    "Cross the street. Pedestrian crossing walk signal is active.",
    "Walk 10 meters. Central Park entrance is on your right."
  ],
  "Grocery Store": [
    "Starting route to Fresh Foods Market. Head South on Main street.",
    "Walk 120 meters. Warning: concrete construction barrier on your left.",
    "Turn left at the next corner.",
    "Market door is directly ahead. Pull handle on the left to enter."
  ]
};

// Music Playlist
const PLAYLIST = [
  { title: "Self-Reliance Audiobook", artist: "Ralph Waldo Emerson" },
  { title: "Lo-Fi Focus Playlist", artist: "Lofi Library" },
  { title: "Morning Ambient sounds", artist: "Nature Sounds" }
];
let playlistIndex = 0;
let isPlaying = false;

// Audio Context for buzzer simulation (Web Audio API)
let audioCtx = null;
let lastBeepTime = 0;
let lastVoiceAlertTime = 0;

// Initialize Elements
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initSettings();
  initEventListeners();
  syncTelemetryUI();
  addLog("System initialized. Welcome to Envision Glasses Simulator.");
});

// OS clock updater
function initClock() {
  const updateClock = () => {
    const now = new Date();
    const clockEl = document.getElementById("os-clock");
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  };
  updateClock();
  setInterval(updateClock, 60000);
}

// Load configurations from settings
function initSettings() {
  const keyInput = document.getElementById("settings-api-key");
  if (config.geminiApiKey) {
    keyInput.value = config.geminiApiKey;
    addLog("Gemini API Key loaded from secure browser storage.");
  }
}

// Write to the visual terminal console
function addLog(text, type = "info") {
  const logBox = document.getElementById("terminal-logs");
  if (!logBox) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.textContent = `[${time}] ${text}`;
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
}

// Audio buzzer sound generator using Web Audio API
function playBuzzerBeep(freq = 800, duration = 0.08) {
  if (!config.buzzerEnabled || !config.isConnected) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume context if suspended (browser security)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Web Audio fail:", e);
  }
}

// Text-to-speech engine using Web Speech API
function speakText(text) {
  if (!window.speechSynthesis) {
    addLog("Speech Synthesis not supported by this browser.", "error");
    return;
  }
  
  // Cancel previous reading for immediate responsiveness
  window.speechSynthesis.cancel();
  
  addLog(`[AUDIO TTS]: "${text}"`, "info");
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = config.speechRate;
  utterance.pitch = 1.0;
  utterance.lang = "en-US";
  
  window.speechSynthesis.speak(utterance);
}

// Adjust TTS speech rate
function adjustSimulatorSpeechRate(change) {
  config.speechRate = Math.round((config.speechRate + change) * 10) / 10;
  config.speechRate = Math.max(0.5, Math.min(2.0, config.speechRate));
  document.getElementById("label-speech-speed").textContent = `${config.speechRate}x`;
  speakText(`Speech rate set to ${config.speechRate}`);
}

// Sync distance and battery to companion phone UI
function syncTelemetryUI() {
  const dist = config.distanceCm;
  const batt = config.batteryLevel;

  // Labels
  document.getElementById("sensor-val-label").textContent = `${Math.round(dist)} cm`;
  document.getElementById("hud-val-distance").textContent = `${Math.round(dist)} cm`;
  document.getElementById("hud-val-battery").textContent = `${batt}%`;
  
  // Range slider
  document.getElementById("sensor-distance-slider").value = dist;

  // Progress fills
  const fill = document.getElementById("hud-progress-fill");
  if (fill) {
    const pct = Math.min(100, (dist / 300) * 100);
    fill.style.width = `${pct}%`;
    
    // Color thresholds
    fill.className = "progress-fill";
    if (dist < 50) {
      fill.classList.add("red");
    } else if (dist < 120) {
      fill.classList.add("yellow");
    } else {
      fill.classList.add("green");
    }
  }

  // Handle critical warnings (Collision Alerts)
  const dangerBanner = document.getElementById("danger-alert-banner");
  if (dist < 40 && config.isConnected) {
    dangerBanner.classList.remove("hidden");
    document.getElementById("alert-distance-text").textContent = `Object detected at ${Math.round(dist)} cm! Take caution.`;
    
    // Play hardware beeping sound
    const now = Date.now();
    // Dynamic beep speed (faster beep as object approaches)
    const beepInterval = Math.max(100, Math.min(600, dist * 2));
    if (now - lastBeepTime > beepInterval) {
      playBuzzerBeep(900, 0.05);
      lastBeepTime = now;
      if (config.hapticEnabled && window.navigator.vibrate) {
        window.navigator.vibrate(50); // Vibration pulse if supported
      }
    }

    // Voice reminder every 4 seconds
    if (now - lastVoiceAlertTime > 4000) {
      speakText("Alert. Obstacle ahead.");
      lastVoiceAlertTime = now;
      addLog("SAFETY WARN: Triggered speech collision warning.", "warn");
    }
  } else {
    dangerBanner.classList.add("hidden");
  }
}

// Event bindings
function initEventListeners() {
  
  // Distance range slider
  const slider = document.getElementById("sensor-distance-slider");
  slider.addEventListener("input", (e) => {
    config.distanceCm = parseInt(e.target.value);
    syncTelemetryUI();
  });

  // Scenario Select dropdown
  const selector = document.getElementById("scenario-select");
  selector.addEventListener("change", (e) => {
    const key = e.target.value;
    const scen = SCENARIOS[key];
    if (!scen) return;

    // Turn off webcam if active
    stopWebcam();

    document.getElementById("scenario-view").classList.remove("hidden");
    document.getElementById("webcam-video").classList.add("hidden");
    
    document.getElementById("scenario-title").textContent = scen.title;
    document.getElementById("scenario-desc").textContent = scen.desc;
    addLog(`Changed glasses environment: ${scen.title}`);
  });

  // Webcam stream trigger
  document.getElementById("btn-use-webcam").addEventListener("click", () => {
    if (config.isWebcamActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  });

  // Hardware button clicks
  document.getElementById("hw-btn-scan").addEventListener("click", () => {
    addLog("Frame capture button clicked on glasses frame.");
    triggerCameraScan();
  });

  document.getElementById("hw-btn-assistant").addEventListener("click", () => {
    addLog("Temple touchpad double-tapped on glasses.");
    switchPhoneTab('assistant');
    triggerVoiceAssistantMic();
  });

  // Mobile App screen controls
  document.getElementById("btn-toggle-pair").addEventListener("click", () => {
    const led = document.getElementById("glasses-power-led");
    const bleIcon = document.getElementById("phone-ble-icon");
    const btn = document.getElementById("btn-toggle-pair");
    const connDot = document.getElementById("app-conn-dot");
    const connTxt = document.getElementById("app-conn-text");
    const hud = document.getElementById("proximity-hud-card");

    if (config.isConnected) {
      // Disconnect
      config.isConnected = false;
      led.textContent = "Offline";
      led.style.background = "rgba(239, 68, 68, 0.1)";
      led.style.color = "var(--color-red)";
      bleIcon.classList.remove("accent-color");
      connDot.className = "status-dot red";
      connTxt.textContent = "Disconnected";
      btn.textContent = "Connect Glasses";
      hud.style.opacity = "0.5";
      speakText("Glasses disconnected.");
      addLog("BLE connection terminated.", "warn");
    } else {
      // Connect
      config.isConnected = true;
      led.textContent = "Active";
      led.style.background = "rgba(34, 197, 94, 0.1)";
      led.style.color = "var(--color-green)";
      bleIcon.classList.add("accent-color");
      connDot.className = "status-dot green";
      connTxt.textContent = "Connected";
      btn.textContent = "Disconnect Glasses";
      hud.style.opacity = "1";
      speakText("Glasses paired successfully.");
      addLog("BLE pairing completed with Envision Glasses.", "info");
      syncTelemetryUI();
    }
  });

  // Phone App Trigger Scanner Button
  document.getElementById("btn-phone-scan").addEventListener("click", () => {
    triggerCameraScan();
  });

  document.getElementById("btn-replay-ocr").addEventListener("click", () => {
    const text = document.getElementById("vision-results-text").textContent;
    speakText(text);
  });

  // Chat message sending
  document.getElementById("btn-send-chat").addEventListener("click", () => {
    sendChatMessage();
  });
  
  document.getElementById("chat-input-text").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  document.getElementById("btn-mic-chat").addEventListener("click", () => {
    triggerVoiceAssistantMic();
  });

  // API Key Saving
  document.getElementById("btn-save-key").addEventListener("click", () => {
    const key = document.getElementById("settings-api-key").value.trim();
    config.geminiApiKey = key;
    localStorage.setItem('envision_gemini_key', key);
    speakText("API Key saved.");
    addLog("API Key updated. Multimodal cloud endpoints enabled.");
  });

  document.getElementById("btn-calibrate-sensors").addEventListener("click", () => {
    speakText("Initiating sensor alignment calibrations. Stand clear of obstacles.");
    addLog("Sensor Calibration routine running...");
    setTimeout(() => {
      speakText("Calibration completed successfully.");
      addLog("Ultrasonic offset reset to 0. All grids recalibrated.");
    }, 2000);
  });

  // Media Player buttons
  document.getElementById("media-play").addEventListener("click", () => {
    toggleMediaPlayer();
  });
  document.getElementById("media-next").addEventListener("click", () => {
    changeAudioTrack(1);
  });
  document.getElementById("media-prev").addEventListener("click", () => {
    changeAudioTrack(-1);
  });

  // Navigation handlers
  document.getElementById("btn-start-nav").addEventListener("click", () => {
    const input = document.getElementById("nav-destination-input").value;
    startNavigation(input);
  });
  document.getElementById("btn-cancel-nav").addEventListener("click", () => {
    cancelNavigation();
  });
}

// Switch companion phone tabs
function switchPhoneTab(tabName) {
  // Hide all screens
  const views = document.querySelectorAll(".screen-view");
  views.forEach(v => v.classList.add("hidden"));
  
  // Show target screen
  const targetView = document.getElementById(`view-${tabName}`);
  if (targetView) targetView.classList.remove("hidden");

  // Deactivate all buttons
  const tabs = document.querySelectorAll(".phone-tabs .tab-item");
  tabs.forEach(t => t.classList.remove("active"));

  // Activate target button
  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) activeTab.classList.add("active");

  // Update header text
  const titleMap = {
    dashboard: "Envision Hub",
    vision: "AI Vision Scanner",
    navigate: "Route Navigator",
    assistant: "AI Assistant",
    settings: "System Config"
  };
  document.getElementById("screen-title").textContent = titleMap[tabName] || "Envision Hub";
  
  // Voice announce tab selection (accessible feature)
  speakText(`${titleMap[tabName]} screen active.`);
}

// Set OCR vs Object mode
function setVisionMode(mode) {
  config.visionMode = mode;
  document.getElementById("tab-mode-ocr").classList.toggle("active", mode === 'ocr');
  document.getElementById("tab-mode-describe").classList.toggle("active", mode === 'describe');
  
  const helper = document.getElementById("vision-mode-helper");
  if (mode === 'ocr') {
    helper.textContent = "Reads text signs, packaging descriptions, or booklets aloud.";
    speakText("Switched to OCR Text Reader.");
  } else {
    helper.textContent = "Describes the layout of immediate objects and paths.";
    speakText("Switched to Object Obstacle Scanner.");
  }
}

// Trigger high-fidelity flash and analyze camera view
async function triggerCameraScan() {
  if (!config.isConnected) {
    speakText("Scanner failed. Glasses are disconnected.");
    return;
  }

  // Switch to vision screen first
  switchPhoneTab('vision');

  // Trigger flash animation
  const flash = document.getElementById("shutter-flash");
  flash.classList.add("flash-active");
  playBuzzerBeep(1100, 0.15); // Shutter beep
  setTimeout(() => flash.classList.remove("flash-active"), 300);

  const resultsCard = document.getElementById("vision-results-card");
  const resultsText = document.getElementById("vision-results-text");
  
  resultsCard.classList.remove("hidden");
  resultsText.textContent = "Processing scene metrics...";
  speakText("Scanning environment. Stand steady.");

  // Simulate network processing delay (1s)
  setTimeout(async () => {
    let result = "";
    
    // If API Key is present, grab webcam screenshot if active or perform custom AI call
    if (config.geminiApiKey) {
      addLog("Sending multimodal visual query to Gemini API...");
      result = await requestGeminiVision();
    } else {
      // Local fallback scenarios
      const selectedScenario = document.getElementById("scenario-select").value;
      const data = SCENARIOS[selectedScenario];
      result = config.visionMode === 'ocr' ? data.ocr : data.describe;
      addLog(`Offline mockup scan processed for scenario: ${selectedScenario}`);
    }

    resultsText.textContent = result;
    speakText(result);
  }, 1200);
}

// Webcam start logic
function startWebcam() {
  const video = document.getElementById("webcam-video");
  const scenView = document.getElementById("scenario-view");
  const btn = document.getElementById("btn-use-webcam");

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      config.isWebcamActive = true;
      video.srcObject = stream;
      video.classList.remove("hidden");
      scenView.classList.add("hidden");
      btn.innerHTML = '<ion-icon name="videocam-off-outline"></ion-icon> Stop Webcam';
      document.getElementById("viewport-mode-tag").textContent = "WEBCAM FEED";
      addLog("Laptop Web camera feed active.");
    })
    .catch(err => {
      addLog("Could not access local web camera feed.", "error");
      speakText("Camera connection failed.");
      console.error(err);
    });
}

function stopWebcam() {
  const video = document.getElementById("webcam-video");
  const scenView = document.getElementById("scenario-view");
  const btn = document.getElementById("btn-use-webcam");

  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  
  config.isWebcamActive = false;
  video.classList.add("hidden");
  scenView.classList.remove("hidden");
  btn.innerHTML = '<ion-icon name="videocam-outline"></ion-icon> Use Webcam';
  document.getElementById("viewport-mode-tag").textContent = "SCENARIO MOCK";
  addLog("Returned to scenario simulator view.");
}

// Music Player controls
function toggleMediaPlayer() {
  const playBtn = document.getElementById("media-play");
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    playBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
    speakText(`Now playing track: ${PLAYLIST[playlistIndex].title}.`);
    addLog(`Music playing: ${PLAYLIST[playlistIndex].title}`);
  } else {
    playBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
    speakText("Music paused.");
    addLog("Music playback suspended.");
  }
}

function changeAudioTrack(dir) {
  playlistIndex += dir;
  if (playlistIndex >= PLAYLIST.length) playlistIndex = 0;
  if (playlistIndex < 0) playlistIndex = PLAYLIST.length - 1;

  document.getElementById("music-track-name").textContent = PLAYLIST[playlistIndex].title;
  document.getElementById("music-track-artist").textContent = PLAYLIST[playlistIndex].artist;

  isPlaying = true;
  document.getElementById("media-play").innerHTML = '<ion-icon name="pause"></ion-icon>';
  speakText(`Playing: ${PLAYLIST[playlistIndex].title}`);
  addLog(`Switched track: ${PLAYLIST[playlistIndex].title}`);
}

// Navigation instructions step management
let navigationSteps = [];
let navStepIndex = 0;

function startNavigation(destinationName) {
  const target = destinationName ? destinationName.trim() : "Pharmacy";
  let steps = NAV_ROUTES[target];

  if (!steps) {
    // Dyn mock route
    steps = [
      `Starting walk route to ${target}. Head straight.`,
      "In 60 meters, warning: sidewalk repair work on your right side.",
      "Turn left onto main road pedestrian crossing.",
      `Arrived at destination ${target}. Entrance door is directly ahead.`
    ];
  }

  navigationSteps = steps;
  navStepIndex = 0;

  document.getElementById("nav-guidance-card").classList.remove("hidden");
  document.getElementById("nav-target-name").textContent = target;
  document.getElementById("nav-step-text").textContent = steps[0];
  document.getElementById("nav-step-counter").textContent = `Step 1 of ${steps.length}`;

  document.getElementById("btn-next-nav-step").textContent = steps.length === 1 ? "Finish" : "Next Step";

  speakText(steps[0]);
  addLog(`Navigation route generated for: ${target}`);
}

function selectNavPreset(preset) {
  document.getElementById("nav-destination-input").value = preset;
  startNavigation(preset);
}

function advanceNavStep() {
  navStepIndex++;
  if (navStepIndex < navigationSteps.length) {
    const text = navigationSteps[navStepIndex];
    document.getElementById("nav-step-text").textContent = text;
    document.getElementById("nav-step-counter").textContent = `Step ${navStepIndex+1} of ${navigationSteps.length}`;
    
    // Change directions icon dynamically for realism
    const icon = document.getElementById("nav-step-icon");
    const icons = ["arrow-up-circle-outline", "warning-outline", "arrow-redo-outline", "checkmark-circle-outline"];
    icon.name = icons[navStepIndex % icons.length];

    if (navStepIndex === navigationSteps.length - 1) {
      document.getElementById("btn-next-nav-step").textContent = "Finish";
    }

    speakText(text);
  } else {
    speakText("Guidance completed. You have arrived at your destination.");
    cancelNavigation();
  }
}

function cancelNavigation() {
  document.getElementById("nav-guidance-card").classList.add("hidden");
  document.getElementById("nav-destination-input").value = "";
  navigationSteps = [];
  navStepIndex = 0;
  speakText("Navigation canceled.");
  addLog("Navigation guidance closed.");
}

// Connect Next Step Button click
document.getElementById("btn-next-nav-step").addEventListener("click", () => {
  advanceNavStep();
});

// Chat assistant logic
async function sendChatMessage(customText = null) {
  const inputEl = document.getElementById("chat-input-text");
  const text = customText || inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  
  // User bubble
  appendChatBubble(text, "user");

  // Loading animation placeholder
  const loadingId = appendChatBubble("<span class='pulse-dot'></span>", "assistant loading");

  // API query
  try {
    let reply = "";
    if (config.geminiApiKey) {
      reply = await requestGeminiChat(text);
    } else {
      reply = getMockAssistantResponse(text);
    }

    // Replace loading placeholder with reply
    const loadEl = document.getElementById(loadingId);
    if (loadEl) {
      loadEl.className = "chat-bubble assistant";
      loadEl.textContent = reply;
    }
    speakText(reply);
  } catch (error) {
    const loadEl = document.getElementById(loadingId);
    if (loadEl) {
      loadEl.className = "chat-bubble assistant error";
      loadEl.textContent = "AI connection failed. Check your API settings.";
    }
    speakText("API request failed.");
  }
}

function appendChatBubble(html, type) {
  const container = document.getElementById("chat-messages");
  const bubble = document.createElement("div");
  const id = "msg-" + Date.now();
  bubble.id = id;
  bubble.className = `chat-bubble ${type}`;
  bubble.innerHTML = html;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return id;
}

// Simulated Microphone toggle
let isRecordingVoice = false;
function triggerVoiceAssistantMic() {
  const micBtn = document.getElementById("btn-mic-chat");
  if (isRecordingVoice) {
    isRecordingVoice = false;
    micBtn.classList.remove("listening");
    
    // Simulate parsing voice prompt
    const prompts = [
      "Where is the nearest pharmacy?",
      "What is the battery level of my glasses?",
      "Help me read this prescription text",
      "Is there a park nearby?"
    ];
    const speechResult = prompts[Math.floor(Math.random() * prompts.length)];
    speakText(`I heard: "${speechResult}"`);
    setTimeout(() => sendChatMessage(speechResult), 1200);
  } else {
    isRecordingVoice = true;
    micBtn.classList.add("listening");
    speakText("Listening to voice commands.");
    // Auto stop recording after 3.5s
    setTimeout(() => {
      if (isRecordingVoice) {
        triggerVoiceAssistantMic();
      }
    }, 3500);
  }
}

// Replay diagnostics helper
function speakQuickDiagnostics() {
  const statusStr = `Systems status check: Glasses are connected with ${config.batteryLevel} percent battery. Path distance readings report ${Math.round(config.distanceCm)} centimeters space. Voice synthesis normal.`;
  speakText(statusStr);
}

// Gemini Direct API Integration
async function requestGeminiChat(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
  const payload = {
    contents: [{
      parts: [{
        text: `You are the voice assistant for the Envision Glasses, a smart wearable aiding visually impaired individuals. Answer the user's question concisely in 1-2 clear sentences. User query: "${prompt}"`
      }]
    }]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } else {
    throw new Error("Gemini error");
  }
}

async function requestGeminiVision() {
  const video = document.getElementById("webcam-video");
  let base64Image = "";

  if (config.isWebcamActive) {
    // Capture canvas frame from webcam
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
  } else {
    // Mock base64 or call placeholder
    const selectedScenario = document.getElementById("scenario-select").value;
    const data = SCENARIOS[selectedScenario];
    return config.visionMode === 'ocr' ? data.ocr : data.describe;
  }

  const systemInstruction = config.visionMode === 'ocr'
    ? "Extract all text readable in this image. Read it aloud exactly. If there's no visible text, say 'No text found.' Keep it under 2 sentences."
    : "Act as real-time audio guidance for a blind person. Describe key obstacles or objects and their approximate direction in front of the user (e.g. 'A blue car parked on the right path'). Do not list details, describe only critical obstacles. Max 2 sentences.";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
  const payload = {
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
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } else {
    return "Failed to analyze camera frame. API communication error.";
  }
}

// Conversational offline fallbacks
function getMockAssistantResponse(prompt) {
  const query = prompt.toLowerCase();
  if (query.includes("time")) {
    return `The current local time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  }
  if (query.includes("weather")) {
    return "The current temperature is 24 degrees Celsius and clear.";
  }
  if (query.includes("battery")) {
    return `Glasses battery level is at ${config.batteryLevel} percent.`;
  }
  if (query.includes("nearest pharmacy") || query.includes("pharmacy")) {
    return "CVS pharmacy is located 2 blocks away. I can guide you there if you click start route in the Navigation tab.";
  }
  if (query.includes("hello") || query.includes("hi")) {
    return "Hello! I am standing by to assist with readouts or walking navigation.";
  }
  return "I am running in offline simulator mode. Please add your Gemini API Key in the settings tab to unlock fully detailed conversational AI.";
}
