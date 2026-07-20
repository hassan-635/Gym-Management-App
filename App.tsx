/**
 * App.tsx — Root application component
 * 
 * Initializes database, loads settings, sets up notifications,
 * and renders the navigation tree. Entry point for the entire app.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useDatabase } from './src/hooks/useDatabase';
import { useNotifications } from './src/hooks/useNotifications';
import { useSettingsStore } from './src/store/useSettingsStore';
import { colors, typography, spacing } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  console.log('🚀 App component mounting...');
  console.log('📱 Platform:', Platform.OS);

  // Initialize database
  const { isReady: dbReady, error: dbError } = useDatabase();
  console.log('📊 Database hook initialized:', { dbReady, dbError });

  // Load settings from AsyncStorage
  const { loadSettings, isLoaded: settingsLoaded } = useSettingsStore();
  console.log('⚙️ Settings hook initialized:', { settingsLoaded });

  // Load settings on mount
  useEffect(() => {
    console.log('🔄 Loading settings on mount...');
    loadSettings().catch(err => {
      console.error('❌ Failed to load settings:', err);
    });
  }, []);

  // Setup notifications (only after settings are loaded)
  useEffect(() => {
    if (settingsLoaded) {
      console.log('🔔 Settings loaded, notifications will be setup by useNotifications hook');
    }
  }, [settingsLoaded]);

  // Show loading screen while initializing
  if (!dbReady || !settingsLoaded) {
    console.log('⏳ Showing loading screen...');
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

  console.log('✅ App ready, rendering main navigator...');
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <StatusBar style="light" />
          <AppNavigator />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
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
