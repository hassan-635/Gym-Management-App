/**
 * components/workout/WorkoutCard.tsx — Day workout summary card
 * 
 * Shows workout status for a specific day on the home screen.
 * Displays day name, exercise count, completion status, and progress.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface WorkoutCardProps {
  dayName: string;
  dayShort: string;
  isToday: boolean;
  isWorkoutDay: boolean;
  isCompleted: boolean;
  exerciseCount: number;
  onPress?: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  dayName,
  dayShort,
  isToday,
  isWorkoutDay,
  isCompleted,
  exerciseCount,
  onPress,
}) => {
  const getStatusIcon = () => {
    if (!isWorkoutDay) return 'bed-outline';
    if (isCompleted) return 'checkmark-circle';
    if (isToday) return 'barbell-outline';
    return 'ellipse-outline';
  };

  const getStatusColor = () => {
    if (!isWorkoutDay) return colors.text.muted;
    if (isCompleted) return colors.accent.success;
    if (isToday) return colors.primary.default;
    return colors.text.muted;
  };

  return (
    <Card
      onPress={isWorkoutDay ? onPress : undefined}
      variant={isToday ? 'glow' : 'default'}
      padding="sm"
      style={[styles.card, isToday && styles.todayCard]}
    >
      <View style={styles.content}>
        {/* Day Label */}
        <Text style={[styles.dayShort, isToday && styles.todayText]}>
          {dayShort}
        </Text>

        {/* Status Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${getStatusColor()}15` }]}>
          <Ionicons
            name={getStatusIcon() as keyof typeof Ionicons.glyphMap}
            size={20}
            color={getStatusColor()}
          />
        </View>

        {/* Exercise Count / Rest Label */}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {isWorkoutDay
            ? isCompleted
              ? 'Done'
              : `${exerciseCount} ex`
            : 'Rest'}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 72,
    marginRight: spacing.sm,
  },
  todayCard: {
    borderColor: colors.primary.glow,
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayShort: {
    ...typography.captionMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  todayText: {
    color: colors.primary.default,
    fontWeight: '700',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.micro,
    fontSize: 10,
  },
});
