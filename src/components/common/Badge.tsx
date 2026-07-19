/**
 * components/common/Badge.tsx — Badge component for labels and status
 * 
 * Small colored badge for muscle group tags, status indicators,
 * and category labels. Supports custom colors from theme.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { MuscleGroup } from '../../types/exercise';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

/**
 * Generic badge component.
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  color = colors.primary.default,
  size = 'sm',
  style,
}) => {
  return (
    <View
      style={[
        styles.base,
        size === 'md' && styles.sizeMd,
        { backgroundColor: `${color}20`, borderColor: `${color}40` },
        style,
      ]}
    >
      <Text style={[styles.text, size === 'md' && styles.textMd, { color }]}>
        {label}
      </Text>
    </View>
  );
};

/**
 * Muscle group specific badge with pre-configured colors.
 */
export const MuscleGroupBadge: React.FC<{
  muscleGroup: MuscleGroup | string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}> = ({ muscleGroup, size = 'sm', style }) => {
  const badgeColor = colors.muscleGroups[muscleGroup] ?? colors.primary.default;
  return <Badge label={muscleGroup} color={badgeColor} size={size} style={style} />;
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sizeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  text: {
    ...typography.micro,
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
});
