/**
 * navigation/TabNavigator.tsx — Bottom tab navigator
 * 
 * 5 tabs: Home, Exercises, Stats, History, Settings
 * Custom styled tab bar with dark theme and active indicators.
 */
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { TabParamList } from './types';

// Screen imports
import { HomeScreen } from '../screens/HomeScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Tab icon mapping
const TAB_ICONS: Record<keyof TabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Exercises: { active: 'barbell', inactive: 'barbell-outline' },
  Stats: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  History: { active: 'calendar', inactive: 'calendar-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          const iconColor = focused ? colors.tabBar.active : colors.tabBar.inactive;
          return <Ionicons name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: colors.tabBar.active,
        tabBarInactiveTintColor: colors.tabBar.inactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar.background,
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.sm,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: spacing.xxs,
  },
  tabBarItem: {
    paddingTop: spacing.xxs,
  },
});
