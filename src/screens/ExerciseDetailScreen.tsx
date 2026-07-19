/**
 * screens/ExerciseDetailScreen.tsx — Exercise detail & history
 * 
 * Shows exercise info, progressive overload chart, history log,
 * and smart overload suggestions.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useExerciseStore } from '../store/useExerciseStore';
import { Card } from '../components/common/Card';
import { MuscleGroupBadge } from '../components/common/Badge';
import { ChartCard } from '../components/stats/ChartCard';
import { EmptyState } from '../components/common/EmptyState';
import { ExerciseHistoryEntry } from '../types/stats';
import * as historyDb from '../database/historyDb';
import { getOverloadSuggestion, getProgressionRate } from '../services/progressiveOverload';
import { formatDateShort, formatRelativeDate } from '../utils/dateUtils';
import { formatWeight, formatSetsReps } from '../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ExerciseDetailRouteProp = RouteProp<RootStackParamList, 'ExerciseDetail'>;

export const ExerciseDetailScreen: React.FC = () => {
  const route = useRoute<ExerciseDetailRouteProp>();
  const navigation = useNavigation();
  const { exerciseId } = route.params;

  const { getExerciseById } = useExerciseStore();
  const exercise = getExerciseById(exerciseId);

  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [personalRecord, setPersonalRecord] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (exerciseId) {
        const data = historyDb.getExerciseHistory(exerciseId, 30);
        setHistory(data);
        setPersonalRecord(historyDb.getPersonalRecord(exerciseId));
      }
    }, [exerciseId])
  );

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="alert-circle-outline"
          title="Exercise Not Found"
          message="This exercise may have been deleted."
        />
      </SafeAreaView>
    );
  }

  // Progressive overload suggestion
  const suggestion = getOverloadSuggestion(exercise.id, exercise.name);
  const progression = getProgressionRate(exercise.id);

  // Chart data (weight over time)
  const chartData = [...history]
    .reverse()
    .map((entry) => ({
      value: entry.maxWeight,
      label: entry.date.slice(5), // MM-DD
      dataPointText: entry.maxWeight.toString(),
    }));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exercise.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Info Card */}
        <Card variant="elevated" padding="lg" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MuscleGroupBadge muscleGroup={exercise.muscleGroup} size="md" />
            <View style={styles.infoStats}>
              <View style={styles.infoStat}>
                <Text style={styles.infoStatValue}>{formatWeight(personalRecord)}</Text>
                <Text style={styles.infoStatLabel}>PR</Text>
              </View>
              <View style={styles.infoStat}>
                <Text style={styles.infoStatValue}>{history.length}</Text>
                <Text style={styles.infoStatLabel}>Sessions</Text>
              </View>
              <View style={styles.infoStat}>
                <Text style={[styles.infoStatValue, {
                  color: progression.direction === 'up' ? colors.accent.success
                    : progression.direction === 'down' ? colors.accent.danger
                    : colors.text.secondary
                }]}>
                  {progression.direction === 'up' ? '↑' : progression.direction === 'down' ? '↓' : '→'}
                  {Math.abs(progression.rate)}%
                </Text>
                <Text style={styles.infoStatLabel}>Progress</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Overload Suggestion */}
        {suggestion && (
          <Card variant="glow" padding="md" style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Ionicons name="trending-up" size={20} color={colors.accent.success} />
              <Text style={styles.suggestionTitle}>Progressive Overload</Text>
            </View>
            <Text style={styles.suggestionText}>{suggestion.reason}</Text>
            <View style={styles.suggestionBadge}>
              <Text style={styles.suggestionBadgeText}>
                Try {formatWeight(suggestion.suggestedWeight)} next session
              </Text>
            </View>
          </Card>
        )}

        {/* Weight Progress Chart */}
        {chartData.length > 1 && (
          <ChartCard title="Weight Progress" subtitle="Max weight per session (kg)">
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - spacing.xl * 4}
              height={180}
              color={colors.primary.default}
              dataPointsColor={colors.primary.light}
              startFillColor={colors.primary.muted}
              endFillColor="transparent"
              areaChart
              curved
              thickness={2}
              hideRules
              yAxisColor="transparent"
              xAxisColor={colors.border.default}
              yAxisTextStyle={{ color: colors.text.muted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.text.muted, fontSize: 8 }}
              noOfSections={4}
              backgroundColor="transparent"
              isAnimated
              animationDuration={800}
            />
          </ChartCard>
        )}

        {/* History Log */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History</Text>

          {history.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <View style={styles.emptyHistory}>
                <Ionicons name="time-outline" size={32} color={colors.text.muted} />
                <Text style={styles.emptyHistoryText}>
                  No history yet. Complete a workout with this exercise to start tracking.
                </Text>
              </View>
            </Card>
          ) : (
            history.map((entry) => (
              <Card key={entry.id} padding="md" style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyDate}>{formatDateShort(entry.date)}</Text>
                    <Text style={styles.historyRelative}>{formatRelativeDate(entry.date)}</Text>
                  </View>
                  <View style={styles.historyStats}>
                    <Text style={styles.historyWeight}>{formatWeight(entry.maxWeight)}</Text>
                    <Text style={styles.historySetsReps}>
                      {formatSetsReps(entry.totalSets, entry.totalReps)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: spacing.huge }} />
      </ScrollView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoStats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  infoStat: {
    alignItems: 'center',
  },
  infoStatValue: {
    ...typography.h3,
    color: colors.text.primary,
  },
  infoStatLabel: {
    ...typography.micro,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },

  // Suggestion
  suggestionCard: {
    marginBottom: spacing.lg,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestionTitle: {
    ...typography.bodyMedium,
    color: colors.accent.success,
  },
  suggestionText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  suggestionBadge: {
    backgroundColor: colors.accent.successMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  suggestionBadgeText: {
    ...typography.captionMedium,
    color: colors.accent.success,
  },

  // History
  historySection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.captionMedium,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  historyCard: {
    marginBottom: spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  historyRelative: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyWeight: {
    ...typography.bodyMedium,
    color: colors.primary.default,
  },
  historySetsReps: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },
  emptyHistory: {
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyHistoryText: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
