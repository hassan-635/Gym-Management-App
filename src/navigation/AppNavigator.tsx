/**
 * navigation/AppNavigator.tsx — Root stack navigator
 * 
 * Wraps the tab navigator with stack screens for modal/detail views.
 * Provides type-safe navigation throughout the app.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { WorkoutScreen } from '../screens/WorkoutScreen';
import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary.default,
          background: colors.background.primary,
          card: colors.background.secondary,
          text: colors.text.primary,
          border: colors.border.default,
          notification: colors.primary.default,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ExerciseDetail"
          component={ExerciseDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
