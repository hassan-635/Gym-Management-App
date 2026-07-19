/**
 * components/workout/SetInput.tsx — Individual set row
 * 
 * A single set within a workout exercise. Contains:
 * - Set number label
 * - Checkbox for completion
 * - Weight input (kg)
 * - Reps input
 * Highlights in green when completed.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { WorkoutSet } from '../../types/workout';
import { triggerHaptic } from '../../utils/helpers';

interface SetInputProps {
  set: WorkoutSet;
  onUpdate: (data: { reps?: number; weight?: number; isCompleted?: boolean }) => void;
  onToggleComplete: () => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export const SetInput: React.FC<SetInputProps> = ({
  set,
  onUpdate,
  onToggleComplete,
  onRemove,
  disabled = false,
}) => {
  const [weightText, setWeightText] = useState(set.weight > 0 ? set.weight.toString() : '');
  const [repsText, setRepsText] = useState(set.reps > 0 ? set.reps.toString() : '');

  // Animated checkbox scale
  const checkboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(set.isCompleted ? 1.1 : 1, { damping: 15 }) }],
  }));

  const handleWeightChange = (text: string) => {
    setWeightText(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      onUpdate({ weight: num });
    } else if (text === '') {
      onUpdate({ weight: 0 });
    }
  };

  const handleRepsChange = (text: string) => {
    setRepsText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 0) {
      onUpdate({ reps: num });
    } else if (text === '') {
      onUpdate({ reps: 0 });
    }
  };

  const handleToggle = () => {
    triggerHaptic(set.isCompleted ? 'light' : 'medium');
    onToggleComplete();
  };

  const rowBg = set.isCompleted ? colors.accent.successMuted : 'transparent';

  return (
    <View style={[styles.container, { backgroundColor: rowBg }]}>
      {/* Set Number */}
      <View style={styles.setNumberContainer}>
        <Text style={[styles.setNumber, set.isCompleted && styles.completedText]}>
          {set.setNumber}
        </Text>
      </View>

      {/* Weight Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, set.isCompleted && styles.completedInput]}
          value={weightText}
          onChangeText={handleWeightChange}
          placeholder="0"
          placeholderTextColor={colors.text.muted}
          keyboardType="numeric"
          editable={!disabled}
          selectTextOnFocus
        />
        <Text style={styles.inputLabel}>kg</Text>
      </View>

      {/* Reps Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, set.isCompleted && styles.completedInput]}
          value={repsText}
          onChangeText={handleRepsChange}
          placeholder="0"
          placeholderTextColor={colors.text.muted}
          keyboardType="numeric"
          editable={!disabled}
          selectTextOnFocus
        />
        <Text style={styles.inputLabel}>reps</Text>
      </View>

      {/* Completion Checkbox */}
      <Animated.View style={checkboxStyle}>
        <TouchableOpacity
          onPress={handleToggle}
          disabled={disabled}
          style={[
            styles.checkbox,
            set.isCompleted && styles.checkboxCompleted,
          ]}
        >
          {set.isCompleted && (
            <Ionicons name="checkmark" size={18} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Remove Button (optional) */}
      {onRemove && !set.isCompleted && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Ionicons name="close-circle" size={18} color={colors.text.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  setNumberContainer: {
    width: 28,
    alignItems: 'center',
  },
  setNumber: {
    ...typography.captionMedium,
    color: colors.text.muted,
  },
  completedText: {
    color: colors.accent.success,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    ...typography.bodyMedium,
    textAlign: 'center',
    paddingVertical: 0,
  },
  completedInput: {
    color: colors.accent.success,
  },
  inputLabel: {
    ...typography.micro,
    color: colors.text.muted,
    fontSize: 9,
    marginLeft: spacing.xxs,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkboxCompleted: {
    backgroundColor: colors.accent.success,
    borderColor: colors.accent.success,
  },
  removeButton: {
    marginLeft: spacing.xs,
    padding: spacing.xxs,
  },
});
