/**
 * screens/SettingsScreen.tsx — App settings & configuration
 * 
 * Manage reminder time, rest timer duration, theme, workout schedule,
 * and exercise assignments per day.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useExerciseStore } from '../store/useExerciseStore';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { MuscleGroupBadge } from '../components/common/Badge';
import { formatTime } from '../utils/dateUtils';
import { TIMER, APP_VERSION } from '../utils/constants';
import { resetDatabase } from '../database/database';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, toggleWorkoutDay, addExerciseToDay, removeExerciseFromDay } = useSettingsStore();
  const { exercises, loadExercises } = useExerciseStore();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Load exercises on mount
  React.useEffect(() => {
    loadExercises();
  }, []);

  const handleReminderTimeChange = (hour: number) => {
    updateSettings({ reminderHour: hour, reminderMinute: 0 });
    setShowTimePicker(false);
  };

  const handleRestTimerChange = (increment: number) => {
    const newDuration = Math.max(
      TIMER.MIN_DURATION,
      Math.min(TIMER.MAX_DURATION, settings.restTimerDuration + increment)
    );
    updateSettings({ restTimerDuration: newDuration });
  };

  const handleResetData = () => {
    Alert.alert(
      '⚠️ Reset All Data',
      'This will delete ALL your workouts, exercises, and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            Alert.alert('Done', 'All data has been reset.');
          },
        },
      ]
    );
  };

  const openDaySchedule = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setShowScheduleModal(true);
  };

  const selectedDay = selectedDayIndex !== null
    ? settings.weekSchedule.find((d) => d.dayIndex === selectedDayIndex)
    : null;

  const isExerciseInDay = (exerciseId: string): boolean => {
    return selectedDay?.exerciseIds.includes(exerciseId) ?? false;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* ── Notifications ── */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <Card padding="none" style={styles.settingsCard}>
          {/* Reminder Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary.default} />
              <Text style={styles.settingLabel}>Daily Reminder</Text>
            </View>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={(v) => updateSettings({ reminderEnabled: v })}
              trackColor={{ false: colors.background.tertiary, true: colors.primary.muted }}
              thumbColor={settings.reminderEnabled ? colors.primary.default : colors.text.muted}
            />
          </View>

          {/* Reminder Time */}
          {settings.reminderEnabled && (
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="time-outline" size={20} color={colors.accent.warning} />
                <Text style={styles.settingLabel}>Reminder Time</Text>
              </View>
              <Text style={styles.settingValue}>
                {formatTime(settings.reminderHour, settings.reminderMinute)}
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* ── Rest Timer ── */}
        <Text style={styles.sectionTitle}>REST TIMER</Text>
        <Card padding="md" style={styles.settingsCard}>
          <View style={styles.timerControl}>
            <Text style={styles.settingLabel}>Rest Duration</Text>
            <View style={styles.timerButtons}>
              <TouchableOpacity
                onPress={() => handleRestTimerChange(-TIMER.STEP)}
                style={styles.timerButton}
                disabled={settings.restTimerDuration <= TIMER.MIN_DURATION}
              >
                <Ionicons name="remove" size={20} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.timerValue}>{settings.restTimerDuration}s</Text>
              <TouchableOpacity
                onPress={() => handleRestTimerChange(TIMER.STEP)}
                style={styles.timerButton}
                disabled={settings.restTimerDuration >= TIMER.MAX_DURATION}
              >
                <Ionicons name="add" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Vibrate Toggle */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.border.default }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.accent.info} />
              <Text style={styles.settingLabel}>Vibrate on Complete</Text>
            </View>
            <Switch
              value={settings.vibrateOnTimerEnd}
              onValueChange={(v) => updateSettings({ vibrateOnTimerEnd: v })}
              trackColor={{ false: colors.background.tertiary, true: colors.primary.muted }}
              thumbColor={settings.vibrateOnTimerEnd ? colors.primary.default : colors.text.muted}
            />
          </View>
        </Card>

        {/* ── Workout Schedule ── */}
        <Text style={styles.sectionTitle}>WORKOUT SCHEDULE</Text>
        <Card padding="none" style={styles.settingsCard}>
          {settings.weekSchedule.map((day, index) => {
            const dayExercises = exercises.filter((e) => day.exerciseIds.includes(e.id));
            return (
              <TouchableOpacity
                key={day.dayIndex}
                style={[styles.scheduleRow, index > 0 && styles.borderTop]}
                onPress={() => openDaySchedule(day.dayIndex)}
              >
                <View style={styles.scheduleLeft}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleWorkoutDay(day.dayIndex);
                    }}
                    style={[
                      styles.scheduleToggle,
                      day.isWorkoutDay && styles.scheduleToggleActive,
                    ]}
                  >
                    {day.isWorkoutDay && (
                      <Ionicons name="checkmark" size={14} color={colors.text.primary} />
                    )}
                  </TouchableOpacity>
                  <View>
                    <Text style={[styles.scheduleDayName, !day.isWorkoutDay && styles.restDayText]}>
                      {day.dayName}
                    </Text>
                    <Text style={styles.scheduleExerciseCount}>
                      {day.isWorkoutDay
                        ? `${dayExercises.length} exercise${dayExercises.length !== 1 ? 's' : ''}`
                        : 'Rest day'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* ── Weight Unit ── */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <Card padding="none" style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="scale-outline" size={20} color={colors.accent.success} />
              <Text style={styles.settingLabel}>Weight Unit</Text>
            </View>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                onPress={() => updateSettings({ weightUnit: 'kg' })}
                style={[styles.unitOption, settings.weightUnit === 'kg' && styles.unitOptionActive]}
              >
                <Text style={[styles.unitText, settings.weightUnit === 'kg' && styles.unitTextActive]}>
                  kg
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateSettings({ weightUnit: 'lbs' })}
                style={[styles.unitOption, settings.weightUnit === 'lbs' && styles.unitOptionActive]}
              >
                <Text style={[styles.unitText, settings.weightUnit === 'lbs' && styles.unitTextActive]}>
                  lbs
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* ── Danger Zone ── */}
        <Text style={styles.sectionTitle}>DATA</Text>
        <Card padding="md" style={styles.settingsCard}>
          <Button
            title="Reset All Data"
            onPress={handleResetData}
            variant="danger"
            size="md"
            fullWidth
            icon="trash-outline"
          />
        </Card>

        {/* App Info */}
        <Text style={styles.appVersion}>Gym Progress Tracker v{APP_VERSION}</Text>
        <Text style={styles.appInfo}>100% Offline • No Cloud • Your Data Stays On Your Device</Text>

        <View style={{ height: spacing.huge }} />
      </ScrollView>

      {/* ── Time Picker Modal ── */}
      <Modal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        title="Reminder Time"
      >
        <ScrollView style={styles.timePickerList}>
          {Array.from({ length: 24 }, (_, h) => (
            <TouchableOpacity
              key={h}
              onPress={() => handleReminderTimeChange(h)}
              style={[
                styles.timeOption,
                settings.reminderHour === h && styles.timeOptionActive,
              ]}
            >
              <Text style={[
                styles.timeOptionText,
                settings.reminderHour === h && styles.timeOptionTextActive,
              ]}>
                {formatTime(h, 0)}
              </Text>
              {settings.reminderHour === h && (
                <Ionicons name="checkmark" size={20} color={colors.primary.default} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>

      {/* ── Schedule Exercise Assignment Modal ── */}
      <Modal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={selectedDay ? `${selectedDay.dayName} Exercises` : 'Schedule'}
      >
        <ScrollView style={styles.exercisePickerList}>
          {exercises.length === 0 ? (
            <Text style={styles.noExercisesText}>
              No exercises created yet. Go to the Exercises tab to add some.
            </Text>
          ) : (
            exercises.map((exercise) => {
              const isSelected = isExerciseInDay(exercise.id);
              return (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => {
                    if (selectedDayIndex === null) return;
                    if (isSelected) {
                      removeExerciseFromDay(selectedDayIndex, exercise.id);
                    } else {
                      addExerciseToDay(selectedDayIndex, exercise.id);
                    }
                  }}
                  style={[styles.exerciseOption, isSelected && styles.exerciseOptionActive]}
                >
                  <View style={styles.exerciseOptionInfo}>
                    <Text style={[styles.exerciseOptionName, isSelected && styles.exerciseOptionNameActive]}>
                      {exercise.name}
                    </Text>
                    <MuscleGroupBadge muscleGroup={exercise.muscleGroup} />
                  </View>
                  <View style={[styles.exerciseCheckbox, isSelected && styles.exerciseCheckboxActive]}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={colors.text.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  sectionTitle: {
    ...typography.micro,
    color: colors.text.muted,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    letterSpacing: 1.5,
  },
  settingsCard: {
    marginHorizontal: spacing.xl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  settingValue: {
    ...typography.bodyMedium,
    color: colors.primary.default,
  },

  // Timer Control
  timerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  timerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    ...typography.h3,
    color: colors.accent.warning,
    minWidth: 50,
    textAlign: 'center',
  },

  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scheduleToggle: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleToggleActive: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },
  scheduleDayName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  restDayText: {
    color: colors.text.muted,
  },
  scheduleExerciseCount: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },

  // Unit Toggle
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  unitOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  unitOptionActive: {
    backgroundColor: colors.primary.default,
  },
  unitText: {
    ...typography.captionMedium,
    color: colors.text.muted,
  },
  unitTextActive: {
    color: colors.text.primary,
  },

  // App Info
  appVersion: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  appInfo: {
    ...typography.micro,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 10,
  },

  // Time Picker
  timePickerList: {
    maxHeight: 300,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  timeOptionActive: {
    backgroundColor: colors.primary.muted,
  },
  timeOptionText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  timeOptionTextActive: {
    color: colors.primary.default,
    fontWeight: '600',
  },

  // Exercise Picker
  exercisePickerList: {
    maxHeight: 400,
  },
  noExercisesText: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  exerciseOptionActive: {
    backgroundColor: colors.primary.muted,
  },
  exerciseOptionInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  exerciseOptionName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  exerciseOptionNameActive: {
    color: colors.primary.default,
  },
  exerciseCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  exerciseCheckboxActive: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },
});
