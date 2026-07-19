/**
 * screens/HomeScreen.tsx — Main home/dashboard screen
 * 
 * Shows today's date, weekly schedule overview, quick-start workout,
 * current streak, and today's exercises preview.
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useExerciseStore } from '../store/useExerciseStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useStatsStore } from '../store/useStatsStore';
import { WorkoutCard } from '../components/workout/WorkoutCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  getToday,
  getDayOfWeek,
  formatDateFull,
  getDayName,
  isDateToday,
} from '../utils/dateUtils';
import { DAYS_SHORT } from '../utils/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { settings } = useSettingsStore();
  const { exercises, loadExercises } = useExerciseStore();
  const { currentWorkout, loadWorkoutForDate } = useWorkoutStore();
  const { stats, loadStats } = useStatsStore();

  const today = getToday();
  const todayDow = getDayOfWeek();
  const todaySchedule = settings.weekSchedule.find((d) => d.dayIndex === todayDow);
  const isRestDay = todaySchedule ? !todaySchedule.isWorkoutDay : false;
  const todayExerciseIds = todaySchedule?.exerciseIds ?? [];

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadExercises();
      loadWorkoutForDate(today);
      loadStats();
    }, [today])
  );

  const handleStartWorkout = () => {
    navigation.navigate('Workout', { date: today });
  };

  const todayExercises = exercises.filter((e) => todayExerciseIds.includes(e.id));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()} 👋
            </Text>
            <Text style={styles.dateText}>{formatDateFull(today)}</Text>
          </View>
          
          {/* Streak Badge */}
          {stats.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
            </View>
          )}
        </View>

        {/* ── Weekly Schedule ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll}>
            {settings.weekSchedule.map((day) => {
              const dayExercises = exercises.filter((e) => day.exerciseIds.includes(e.id));
              return (
                <WorkoutCard
                  key={day.dayIndex}
                  dayName={day.dayName}
                  dayShort={day.dayShort}
                  isToday={day.dayIndex === todayDow}
                  isWorkoutDay={day.isWorkoutDay}
                  isCompleted={
                    day.dayIndex === todayDow && currentWorkout?.isCompleted === true
                  }
                  exerciseCount={dayExercises.length}
                  onPress={() => {
                    if (day.dayIndex === todayDow) {
                      handleStartWorkout();
                    }
                  }}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* ── Today's Status ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>

          {isRestDay ? (
            /* Rest Day Card */
            <Card variant="default" padding="lg">
              <View style={styles.restDayContent}>
                <Text style={styles.restDayEmoji}>😴</Text>
                <Text style={styles.restDayTitle}>Rest Day</Text>
                <Text style={styles.restDayMessage}>
                  Recovery is just as important as training. Enjoy your rest!
                </Text>
              </View>
            </Card>
          ) : currentWorkout?.isCompleted ? (
            /* Completed Card */
            <Card variant="glow" padding="lg">
              <View style={styles.completedContent}>
                <Ionicons name="checkmark-circle" size={48} color={colors.accent.success} />
                <Text style={styles.completedTitle}>Workout Complete! 💪</Text>
                <Text style={styles.completedVolume}>
                  Volume: {currentWorkout.totalVolume.toFixed(0)} kg
                </Text>
              </View>
            </Card>
          ) : (
            /* Today's Workout Preview */
            <View>
              {todayExercises.length > 0 ? (
                <Card variant="elevated" padding="md">
                  <Text style={styles.previewTitle}>
                    {todayExercises.length} Exercises Planned
                  </Text>
                  {todayExercises.slice(0, 4).map((exercise) => (
                    <View key={exercise.id} style={styles.previewExercise}>
                      <View style={[styles.dot, { backgroundColor: colors.muscleGroups[exercise.muscleGroup] ?? colors.primary.default }]} />
                      <Text style={styles.previewExerciseName}>{exercise.name}</Text>
                      <Text style={styles.previewMuscle}>{exercise.muscleGroup}</Text>
                    </View>
                  ))}
                  {todayExercises.length > 4 && (
                    <Text style={styles.moreText}>+{todayExercises.length - 4} more</Text>
                  )}
                </Card>
              ) : (
                <Card variant="outlined" padding="lg">
                  <View style={styles.noExercisesContent}>
                    <Ionicons name="add-circle-outline" size={36} color={colors.text.muted} />
                    <Text style={styles.noExercisesText}>
                      No exercises assigned for {getDayName()}.
                    </Text>
                    <Text style={styles.noExercisesHint}>
                      Go to Settings → Schedule to assign exercises.
                    </Text>
                  </View>
                </Card>
              )}

              {/* Start Workout Button */}
              <View style={styles.startButtonContainer}>
                <Button
                  title={currentWorkout ? 'Continue Workout' : 'Start Workout'}
                  onPress={handleStartWorkout}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon="flash"
                  disabled={todayExercises.length === 0 && !currentWorkout}
                />
              </View>
            </View>
          )}
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.quickStatsRow}>
            <Card variant="default" padding="sm" style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{stats.completedWorkouts}</Text>
              <Text style={styles.quickStatLabel}>Workouts</Text>
            </Card>
            <Card variant="default" padding="sm" style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{stats.consistencyPercentage}%</Text>
              <Text style={styles.quickStatLabel}>Consistency</Text>
            </Card>
            <Card variant="default" padding="sm" style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{formatVolume(stats.totalVolumeLiftedKg)}</Text>
              <Text style={styles.quickStatLabel}>Volume</Text>
            </Card>
          </View>
        </View>

        <View style={{ height: spacing.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Helpers ──

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatVolume = (kg: number): string => {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}K`;
  return `${kg.toFixed(0)}`;
};

// ── Styles ──

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  greeting: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  dateText: {
    ...typography.body,
    color: colors.text.muted,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.warningMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xxs,
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakNumber: {
    ...typography.bodyMedium,
    color: colors.accent.warning,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.captionMedium,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  weekScroll: {
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },

  // Rest Day
  restDayContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  restDayEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  restDayTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  restDayMessage: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
  },

  // Completed
  completedContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  completedTitle: {
    ...typography.h3,
    color: colors.accent.success,
    marginTop: spacing.md,
  },
  completedVolume: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },

  // Preview
  previewTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  previewExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  previewExerciseName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  previewMuscle: {
    ...typography.caption,
    color: colors.text.muted,
  },
  moreText: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // No exercises
  noExercisesContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  noExercisesText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  noExercisesHint: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },

  // Start button
  startButtonContainer: {
    marginTop: spacing.lg,
  },

  // Quick Stats
  quickStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    ...typography.h3,
    color: colors.primary.default,
  },
  quickStatLabel: {
    ...typography.micro,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },
});
