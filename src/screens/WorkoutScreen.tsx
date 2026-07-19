/**
 * screens/WorkoutScreen.tsx — Active workout session screen
 * 
 * Core workout tracking with exercise rows, set inputs, checkboxes,
 * rest timer, auto-completion, and workout completion flow.
 */
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useExerciseStore } from '../store/useExerciseStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useRestTimer } from '../hooks/useRestTimer';
import { ExerciseRow } from '../components/workout/ExerciseRow';
import { RestTimerOverlay } from '../components/workout/RestTimerOverlay';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { formatDateShort, getDayOfWeek } from '../utils/dateUtils';
import { calculateTotalVolume } from '../utils/helpers';

type WorkoutRouteProp = RouteProp<RootStackParamList, 'Workout'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const WorkoutScreen: React.FC = () => {
  const route = useRoute<WorkoutRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { date } = route.params;

  const {
    currentWorkout,
    loadWorkoutForDate,
    createWorkout,
    updateSet,
    toggleSetCompletion,
    addSet,
    removeSet,
    completeWorkout,
    startWorkout,
    isActive,
  } = useWorkoutStore();

  const { exercises, loadExercises } = useExerciseStore();
  const { settings } = useSettingsStore();
  const restTimer = useRestTimer();

  // Load workout data
  useEffect(() => {
    loadExercises();
    loadWorkoutForDate(date);
  }, [date]);

  // Create workout if it doesn't exist and exercises are assigned
  useEffect(() => {
    if (!currentWorkout && exercises.length > 0) {
      const dayOfWeek = getDayOfWeek(date);
      const daySchedule = settings.weekSchedule.find((d) => d.dayIndex === dayOfWeek);
      const scheduledExerciseIds = daySchedule?.exerciseIds ?? [];
      
      if (scheduledExerciseIds.length > 0) {
        const exerciseDetails = scheduledExerciseIds
          .map((id) => exercises.find((e) => e.id === id))
          .filter((e): e is NonNullable<typeof e> => e !== undefined)
          .map((e) => ({ id: e.id, name: e.name, muscleGroup: e.muscleGroup }));

        if (exerciseDetails.length > 0) {
          createWorkout(date, exerciseDetails);
          startWorkout();
        }
      }
    } else if (currentWorkout && !isActive && !currentWorkout.isCompleted) {
      startWorkout();
    }
  }, [currentWorkout, exercises]);

  // Handle set toggle — start rest timer when a set is completed
  const handleToggleSet = useCallback((setId: string, workoutExerciseId: string) => {
    const exercise = currentWorkout?.exercises.find((e) => e.id === workoutExerciseId);
    const set = exercise?.sets.find((s) => s.id === setId);
    
    toggleSetCompletion(setId, workoutExerciseId);

    // Start rest timer when completing a set (not unchecking)
    if (set && !set.isCompleted) {
      restTimer.startRest();
    }
  }, [currentWorkout]);

  // Handle workout completion
  const handleComplete = () => {
    if (!currentWorkout) return;

    const allCompleted = currentWorkout.exercises.every((e) => e.isCompleted);

    if (!allCompleted) {
      Alert.alert(
        'Incomplete Workout',
        'Not all exercises are completed. Complete anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete', onPress: () => completeWorkout() },
        ]
      );
    } else {
      completeWorkout();
      Alert.alert('🎉 Workout Complete!', 'Great job! Your progress has been saved.');
    }
  };

  // Calculate current volume
  const currentVolume = currentWorkout
    ? calculateTotalVolume(currentWorkout.exercises)
    : 0;

  const completedExercises = currentWorkout?.exercises.filter((e) => e.isCompleted).length ?? 0;
  const totalExercises = currentWorkout?.exercises.length ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Workout</Text>
          <Text style={styles.headerDate}>{formatDateShort(date)}</Text>
        </View>

        {/* Rest Timer Quick Button */}
        <TouchableOpacity onPress={restTimer.startRest} style={styles.timerButton}>
          <Ionicons name="timer-outline" size={22} color={colors.accent.warning} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {currentWorkout && !currentWorkout.isCompleted && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: totalExercises > 0
                    ? `${(completedExercises / totalExercises) * 100}%`
                    : '0%',
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedExercises}/{totalExercises} exercises • {currentVolume.toFixed(0)} kg
          </Text>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentWorkout ? (
          currentWorkout.isCompleted ? (
            /* Completed State */
            <View style={styles.completedContainer}>
              <Ionicons name="checkmark-circle" size={64} color={colors.accent.success} />
              <Text style={styles.completedTitle}>Workout Complete! 🎉</Text>
              <Text style={styles.completedVolume}>
                Total Volume: {currentWorkout.totalVolume.toFixed(0)} kg
              </Text>
              <Text style={styles.completedDuration}>
                Duration: {currentWorkout.durationMinutes} min
              </Text>
              <Button
                title="Back to Home"
                onPress={() => navigation.goBack()}
                variant="primary"
                size="lg"
                style={{ marginTop: spacing.xxl }}
              />
            </View>
          ) : (
            /* Active Workout */
            <>
              {currentWorkout.exercises.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  onUpdateSet={(setId, data) => updateSet(setId, exercise.id, data)}
                  onToggleSet={(setId) => handleToggleSet(setId, exercise.id)}
                  onAddSet={() => addSet(exercise.id)}
                  onRemoveSet={(setId) => removeSet(setId, exercise.id)}
                  disabled={currentWorkout.isCompleted}
                />
              ))}

              {/* Complete Workout Button */}
              <View style={styles.completeButtonContainer}>
                <Button
                  title="Complete Workout ✓"
                  onPress={handleComplete}
                  variant="success"
                  size="lg"
                  fullWidth
                  icon="checkmark-circle"
                />
              </View>

              <View style={{ height: spacing.huge * 2 }} />
            </>
          )
        ) : (
          <EmptyState
            icon="barbell-outline"
            title="No Exercises Assigned"
            message="Assign exercises to this day in Settings → Schedule to start tracking."
            actionLabel="Go to Settings"
            onAction={() => {
              navigation.goBack();
            }}
          />
        )}
      </ScrollView>

      {/* Rest Timer Overlay */}
      <RestTimerOverlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  headerDate: {
    ...typography.caption,
    color: colors.text.muted,
  },
  timerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.default,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  completeButtonContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
  },
  completedTitle: {
    ...typography.h2,
    color: colors.accent.success,
    marginTop: spacing.xl,
  },
  completedVolume: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  completedDuration: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
});
