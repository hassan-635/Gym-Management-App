/**
 * components/stats/StatBlock.tsx — Individual stat display
 * 
 * Shows a single statistic with icon, label, and animated value.
 * Used on the Stats screen in a grid layout.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface StatBlockProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  formatter?: (value: number) => string;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  icon,
  label,
  value,
  suffix = '',
  prefix = '',
  color = colors.primary.default,
  formatter,
}) => {
  return (
    <Card variant="default" padding="md" style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <AnimatedNumber
        value={value}
        prefix={prefix}
        suffix={suffix}
        style={[styles.value, { color }]}
        formatter={formatter}
      />
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    minWidth: '45%',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.h2,
    marginBottom: spacing.xxs,
  },
  label: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
