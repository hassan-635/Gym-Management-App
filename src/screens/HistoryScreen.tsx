/**
 * screens/HistoryScreen.tsx — Workout history list
 * 
 * Shows completed and past workouts in chronological order.
 * Each entry shows date, exercises, volume, and completion status.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { WorkoutSummary } from '../types/workout';
import * as workoutDb from '../database/workoutDb';
import { formatDateShort, formatRelativeDate } from '../utils/dateUtils';
import { formatLargeNumber } from '../utils/helpers';
import { DAYS_SHORT } from '../utils/constants';

export const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<WorkoutSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = () => {
    setIsLoading(true);
    try {
      const data = workoutDb.getWorkoutHistory(100);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
    setIsLoading(false);
  };

  const renderHistoryItem = ({ item }: { item: WorkoutSummary }) => {
    const dayName = DAYS_SHORT[item.dayOfWeek] ?? '';

    return (
      <Card padding="md" style={styles.historyCard}>
        <View style={styles.cardRow}>
          {/* Status Indicator */}
          <View style={[
            styles.statusDot,
            { backgroundColor: item.isCompleted ? colors.accent.success : colors.accent.warning }
          ]} />

          {/* Date & Info */}
          <View style={styles.cardInfo}>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{formatDateShort(item.date)}</Text>
              <Text style={styles.dayBadge}>{dayName}</Text>
            </View>
            <Text style={styles.relativeDate}>{formatRelativeDate(item.date)}</Text>
          </View>

          {/* Stats */}
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={14} color={colors.text.muted} />
              <Text style={styles.statValue}>
                {item.completedExerciseCount}/{item.exerciseCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={14} color={colors.text.muted} />
              <Text style={styles.statValue}>{formatLargeNumber(item.totalVolume)} kg</Text>
            </View>
          </View>

          {/* Completion Icon */}
          {item.isCompleted ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.accent.success} />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color={colors.text.muted} />
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{history.length} workouts</Text>
      </View>

      {/* History List */}
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={loadHistory}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No Workout History"
            message="Complete your first workout to start building your history."
          />
        }
      />
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
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  historyCard: {
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  dayBadge: {
    ...typography.micro,
    color: colors.primary.default,
    backgroundColor: colors.primary.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
    fontSize: 9,
  },
  relativeDate: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },
  cardStats: {
    marginRight: spacing.md,
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statValue: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
