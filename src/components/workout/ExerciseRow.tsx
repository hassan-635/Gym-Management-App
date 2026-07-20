/**
 * components/workout/ExerciseRow.tsx — Exercise card within a workout
 * 
 * Expandable exercise row showing exercise name, muscle group badge,
 * and all sets. Supports adding/removing sets.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { WorkoutExercise } from '../../types/workout';
import { MuscleGroupBadge } from '../common/Badge';
import { SetInput } from './SetInput';

interface ExerciseRowProps {
  exercise: WorkoutExercise;
  onUpdateSet: (setId: string, data: { reps?: number; weight?: number; isCompleted?: boolean }) => void;
  onToggleSet: (setId: string) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  disabled?: boolean;
}

export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  onUpdateSet,
  onToggleSet,
  onAddSet,
  onRemoveSet,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedSets = exercise.sets.filter((s) => s.isCompleted).length;
  const totalSets = exercise.sets.length;
  const progressText = `${completedSets}/${totalSets}`;

  return (
    <View style={[styles.container, exercise.isCompleted && styles.completedContainer]}>
      {/* Header — tap to expand/collapse */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          {/* Completion indicator */}
          <View style={[styles.indicator, exercise.isCompleted && styles.indicatorCompleted]} />
          
          <View style={styles.headerInfo}>
            <Text style={[styles.exerciseName, exercise.isCompleted && styles.completedName]}>
              {exercise.exerciseName}
            </Text>
            <View style={styles.metaRow}>
              <MuscleGroupBadge muscleGroup={exercise.muscleGroup} />
              {exercise.targetMinReps !== undefined && exercise.targetMaxReps !== undefined && (
                <Text style={styles.targetReps}>
                  🎯 {exercise.targetMinReps}-{exercise.targetMaxReps} reps
                </Text>
              )}
              <Text style={styles.progressText}>{progressText} sets</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {exercise.isCompleted && (
            <Ionicons name="checkmark-circle" size={24} color={colors.accent.success} style={{ marginRight: spacing.sm }} />
          )}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text.muted}
          />
        </View>
      </TouchableOpacity>

      {/* Sets List (expandable) */}
      {isExpanded && (
        <View style={styles.setsContainer}>
          {/* Column Headers */}
          <View style={styles.columnHeaders}>
            <Text style={[styles.columnLabel, { width: 28 }]}>SET</Text>
            <Text style={[styles.columnLabel, { flex: 1, textAlign: 'center' }]}>WEIGHT</Text>
            <Text style={[styles.columnLabel, { flex: 1, textAlign: 'center' }]}>REPS</Text>
            <Text style={[styles.columnLabel, { width: 32, textAlign: 'center' }]}>✓</Text>
          </View>

          {/* Individual Sets */}
          {exercise.sets.map((set) => (
            <SetInput
              key={set.id}
              set={set}
              onUpdate={(data) => onUpdateSet(set.id, data)}
              onToggleComplete={() => onToggleSet(set.id)}
              onRemove={totalSets > 1 ? () => onRemoveSet(set.id) : undefined}
              disabled={disabled}
            />
          ))}

          {/* Add Set Button */}
          {!disabled && !exercise.isCompleted && (
            <TouchableOpacity onPress={onAddSet} style={styles.addSetButton}>
              <Ionicons name="add" size={16} color={colors.primary.default} />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  completedContainer: {
    borderColor: colors.accent.successMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    backgroundColor: colors.primary.default,
    marginRight: spacing.md,
  },
  indicatorCompleted: {
    backgroundColor: colors.accent.success,
  },
  headerInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  completedName: {
    color: colors.accent.success,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  targetReps: {
    ...typography.caption,
    color: colors.accent.info,
    backgroundColor: colors.accent.infoMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setsContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  columnHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  columnLabel: {
    ...typography.micro,
    color: colors.text.muted,
    fontSize: 9,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary.muted,
    borderStyle: 'dashed',
  },
  addSetText: {
    ...typography.captionMedium,
    color: colors.primary.default,
    marginLeft: spacing.xs,
  },
});
