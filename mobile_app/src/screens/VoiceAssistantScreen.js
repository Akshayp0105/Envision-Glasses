import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { askAssistant } from '../services/geminiService';
import { speak, stop } from '../services/voiceService';

// Mock Playlist
const PLAYLIST = [
  { id: 1, title: "Self-Reliance Audiobook", artist: "Ralph Waldo Emerson", duration: "45:12" },
  { id: 2, title: "Lo-Fi Beats for Focus", artist: "Lofi Library", duration: "3:40" },
  { id: 3, title: "Morning Walk Ambient", artist: "Nature Sounds", duration: "12:00" }
];

export default function VoiceAssistantScreen() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'assistant', text: "Hello! I am your Envision AI assistant. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Music Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);

  useEffect(() => {
    speak("Voice assistant and media player active. Speak your question or select an audio track.");
    return () => {
      stop();
    };
  }, []);

  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || inputText;
    if (!prompt.trim()) return;

    // Add User Message
    const userMsg = { id: Date.now(), type: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsResponding(true);

    // Call Gemini
    const reply = await askAssistant(prompt);
    
    // Add Assistant Message
    const assistantMsg = { id: Date.now() + 1, type: 'assistant', text: reply };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsResponding(false);

    // Speak response
    speak(reply);
  };

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
      // Simulate speech captured
      const mockVoicePrompts = [
        "What time is it?",
        "How is the weather?",
        "Read my glasses battery status.",
        "Recommend a path direction."
      ];
      const randomPrompt = mockVoicePrompts[Math.floor(Math.random() * mockVoicePrompts.length)];
      speak(`I heard: "${randomPrompt}"`);
      handleSendMessage(randomPrompt);
    } else {
      setIsListening(true);
      speak("Listening...");
      // Simulate auto-stop listening after 3s
      setTimeout(() => {
        setIsListening(false);
      }, 3000);
    }
  };

  // Music Controls
  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      speak(`Playing track: ${PLAYLIST[currentTrackIdx].title}.`);
    } else {
      speak("Music paused.");
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIdx + 1) % PLAYLIST.length;
    setCurrentTrackIdx(nextIdx);
    setIsPlaying(true);
    speak(`Playing next track: ${PLAYLIST[nextIdx].title}.`);
  };

  const handlePrevTrack = () => {
    const prevIdx = currentTrackIdx === 0 ? PLAYLIST.length - 1 : currentTrackIdx - 1;
    setCurrentTrackIdx(prevIdx);
    setIsPlaying(true);
    speak(`Playing previous track: ${PLAYLIST[prevIdx].title}.`);
  };

  return (
    <View style={styles.container}>
      {/* 1. Embedded Media Card */}
      <View style={styles.mediaCard}>
        <View style={styles.mediaHeader}>
          <Ionicons name="musical-notes" size={20} color="#ec4899" />
          <Text style={styles.mediaHeaderTitle}>Envision Audio Hub</Text>
        </View>

        <View style={styles.trackDetails}>
          <Text style={styles.trackName} numberOfLines={1}>
            {PLAYLIST[currentTrackIdx].title}
          </Text>
          <Text style={styles.trackArtist}>
            {PLAYLIST[currentTrackIdx].artist}
          </Text>
        </View>

        {/* Media Control Row */}
        <View style={styles.mediaControls}>
          <TouchableOpacity onPress={handlePrevTrack} style={styles.ctrlIcon}>
            <Ionicons name="play-back" size={26} color="#fafafa" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} style={styles.playIconContainer}>
            <Ionicons 
              name={isPlaying ? "pause-circle" : "play-circle"} 
              size={48} 
              color="#ec4899" 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNextTrack} style={styles.ctrlIcon}>
            <Ionicons name="play-forward" size={26} color="#fafafa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Chat Conversation Viewport */}
      <ScrollView 
        style={styles.chatViewport} 
        contentContainerStyle={styles.chatContent}
        ref={(ref) => { this.scrollView = ref; }}
        onContentSizeChange={() => this.scrollView?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.bubble, 
              msg.type === 'user' ? styles.userBubble : styles.assistantBubble
            ]}
          >
            <Text 
              style={[
                styles.bubbleText,
                msg.type === 'user' ? styles.userText : styles.assistantText
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {isResponding && (
          <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color="#a1a1aa" />
          </View>
        )}
      </ScrollView>

      {/* 3. Input & Voice Assistant Panel */}
      <View style={styles.inputPanel}>
        <View style={styles.textBoxRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type query to assistant..."
            placeholderTextColor="#71717a"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage()}
          />
          {inputText.trim().length > 0 && (
            <TouchableOpacity style={styles.sendIcon} onPress={() => handleSendMessage()}>
              <Ionicons name="send" size={20} color="#6366f1" />
            </TouchableOpacity>
          )}
        </View>

        {/* Microphone button */}
        <View style={styles.micRow}>
          <TouchableOpacity 
            style={[styles.micBtn, isListening && styles.micBtnListening]} 
            onPress={handleMicToggle}
          >
            <Ionicons 
              name={isListening ? "mic" : "mic-outline"} 
              size={36} 
              color="#fafafa" 
            />
          </TouchableOpacity>
          <Text style={styles.micLabel}>
            {isListening ? "Listening..." : "Tap Mic to Talk"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  mediaCard: {
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    padding: 14,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  mediaHeaderTitle: {
    color: '#ec4899',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  trackDetails: {
    alignItems: 'center',
    marginVertical: 4,
  },
  trackName: {
    color: '#fafafa',
    fontSize: 15,
    fontWeight: '700',
  },
  trackArtist: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  mediaControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  ctrlIcon: {
    padding: 10,
    marginHorizontal: 15,
  },
  playIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatViewport: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 25,
  },
  bubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#6366f1',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    backgroundColor: '#18181b',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#fafafa',
  },
  loadingBubble: {
    paddingVertical: 12,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPanel: {
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  textBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    color: '#fafafa',
    fontSize: 14,
  },
  sendIcon: {
    padding: 6,
  },
  micRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  micBtnListening: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  micLabel: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textTransform: 'uppercase',
  },
});
