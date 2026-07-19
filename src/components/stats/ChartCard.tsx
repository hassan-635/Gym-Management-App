/**
 * components/stats/ChartCard.tsx — Chart container card
 * 
 * Wraps gifted-charts with a titled card for the Stats screen.
 * Provides consistent styling for all chart types.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { colors, spacing, typography } from '../../theme';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <Card variant="default" padding="md" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.chartContainer}>
        {children}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
  },
});
