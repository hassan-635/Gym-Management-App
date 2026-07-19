/**
 * App.tsx — Root application component
 * 
 * Initializes database, loads settings, sets up notifications,
 * and renders the navigation tree. Entry point for the entire app.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useDatabase } from './src/hooks/useDatabase';
import { useNotifications } from './src/hooks/useNotifications';
import { useSettingsStore } from './src/store/useSettingsStore';
import { colors, typography, spacing } from './src/theme';

export default function App() {
  // Initialize database
  const { isReady: dbReady, error: dbError } = useDatabase();

  // Load settings from AsyncStorage
  const { loadSettings, isLoaded: settingsLoaded } = useSettingsStore();

  // Setup notifications (runs after settings are loaded)
  useNotifications();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Show loading screen while initializing
  if (!dbReady || !settingsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingLogo}>🏋️</Text>
        <Text style={styles.loadingTitle}>Gym Progress Tracker</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary.default}
          style={styles.loadingSpinner}
        />
        {dbError && (
          <Text style={styles.errorText}>Error: {dbError}</Text>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  loadingTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xxl,
  },
  loadingSpinner: {
    marginTop: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.accent.danger,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
