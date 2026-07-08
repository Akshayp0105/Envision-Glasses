import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import Screens
import DashboardScreen from './src/screens/DashboardScreen';
import CameraOcrScreen from './src/screens/CameraOcrScreen';
import NavigationScreen from './src/screens/NavigationScreen';
import VoiceAssistantScreen from './src/screens/VoiceAssistantScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Premium Custom Dark Theme
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6366f1',      // Indigo accent
    background: '#09090b',   // Very dark gray/black
    card: '#18181b',         // Dark card gray
    text: '#fafafa',         // Off-white text
    border: '#27272a',       // Subtle border gray
    notification: '#ef4444', // Red alerts
  },
};

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer theme={CustomDarkTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Vision') {
                iconName = focused ? 'eye' : 'eye-outline';
              } else if (route.name === 'Navigate') {
                iconName = focused ? 'navigate' : 'navigate-outline';
              } else if (route.name === 'Assistant') {
                iconName = focused ? 'mic' : 'mic-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#6366f1',
            tabBarInactiveTintColor: '#a1a1aa',
            tabBarStyle: {
              backgroundColor: '#18181b',
              borderTopColor: '#27272a',
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            headerStyle: {
              backgroundColor: '#18181b',
              borderBottomColor: '#27272a',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fafafa',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 20,
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Vision" component={CameraOcrScreen} options={{ title: 'AI OCR Vision' }} />
          <Tab.Screen name="Navigate" component={NavigationScreen} options={{ title: 'Navigation' }} />
          <Tab.Screen name="Assistant" component={VoiceAssistantScreen} options={{ title: 'Voice Assistant' }} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
});
