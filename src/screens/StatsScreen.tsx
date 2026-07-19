/**
 * screens/StatsScreen.tsx — Statistics & analytics dashboard
 * 
 * Shows workout statistics with animated counters and charts.
 * Includes total workouts, streak, consistency, volume, and distributions.
 */
import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useStatsStore } from '../store/useStatsStore';
import { StatBlock } from '../components/stats/StatBlock';
import { ChartCard } from '../components/stats/ChartCard';
import { EmptyState } from '../components/common/EmptyState';
import { getConsistencyGrade } from '../services/statsCalculator';
import { formatLargeNumber } from '../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const StatsScreen: React.FC = () => {
  const { stats, weeklyFrequency, monthlyVolume, muscleDistribution, loadStats } = useStatsStore();

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const consistencyGrade = getConsistencyGrade(stats.consistencyPercentage);

  // If no data yet, show empty state
  if (stats.totalWorkouts === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
        </View>
        <EmptyState
          icon="stats-chart-outline"
          title="No Stats Yet"
          message="Complete your first workout to start seeing your statistics and progress."
        />
      </SafeAreaView>
    );
  }

  // Prepare chart data
  const barChartData = weeklyFrequency.map((d) => ({
    value: d.value,
    label: d.label,
    frontColor: d.value > 0 ? colors.primary.default : colors.background.tertiary,
    topLabelComponent: () => (
      <Text style={styles.barLabel}>{d.value > 0 ? d.value : ''}</Text>
    ),
  }));

  const pieData = muscleDistribution.map((d) => ({
    value: d.count,
    color: d.color,
    text: `${d.percentage}%`,
    textColor: colors.text.primary,
    textSize: 10,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeEmoji}>{consistencyGrade.emoji}</Text>
            <Text style={styles.gradeText}>{consistencyGrade.grade}</Text>
          </View>
        </View>

        {/* Stat Blocks Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatBlock
              icon="barbell"
              label="Total Workouts"
              value={stats.totalWorkouts}
              color={colors.primary.default}
            />
            <StatBlock
              icon="checkmark-circle"
              label="Completed"
              value={stats.completedWorkouts}
              color={colors.accent.success}
            />
          </View>

          <View style={styles.statsRow}>
            <StatBlock
              icon="flame"
              label="Current Streak"
              value={stats.currentStreak}
              suffix=" days"
              color={colors.accent.warning}
            />
            <StatBlock
              icon="speedometer"
              label="Consistency"
              value={stats.consistencyPercentage}
              suffix="%"
              color={colors.accent.info}
            />
          </View>

          <View style={styles.statsRow}>
            <StatBlock
              icon="body"
              label="Most Trained"
              value={0}
              formatter={() => stats.mostTrainedMuscle}
              color={colors.muscleGroups[stats.mostTrainedMuscle] ?? colors.primary.default}
            />
            <StatBlock
              icon="trending-up"
              label="Volume Lifted"
              value={stats.totalVolumeLiftedKg}
              formatter={(v) => `${formatLargeNumber(v)} kg`}
              color={colors.primary.light}
            />
          </View>
        </View>

        {/* Weekly Frequency Chart */}
        <View style={styles.chartSection}>
          <ChartCard title="Weekly Activity" subtitle="Workouts per day of the week">
            <BarChart
              data={barChartData}
              width={SCREEN_WIDTH - spacing.xl * 4}
              height={150}
              barWidth={28}
              spacing={12}
              roundedTop
              roundedBottom
              noOfSections={4}
              hideRules
              yAxisColor="transparent"
              xAxisColor={colors.border.default}
              yAxisTextStyle={{ color: colors.text.muted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.text.muted, fontSize: 10 }}
              backgroundColor="transparent"
              isAnimated
              animationDuration={600}
            />
          </ChartCard>
        </View>

        {/* Muscle Distribution */}
        {pieData.length > 0 && (
          <View style={styles.chartSection}>
            <ChartCard title="Muscle Distribution" subtitle="Training focus breakdown">
              <View style={styles.pieContainer}>
                <PieChart
                  data={pieData}
                  donut
                  radius={80}
                  innerRadius={50}
                  innerCircleColor={colors.background.secondary}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text style={styles.pieCenterValue}>{muscleDistribution.length}</Text>
                      <Text style={styles.pieCenterLabel}>Groups</Text>
                    </View>
                  )}
                />

                {/* Legend */}
                <View style={styles.legend}>
                  {muscleDistribution.map((d) => (
                    <View key={d.name} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                      <Text style={styles.legendText}>{d.name}</Text>
                      <Text style={styles.legendValue}>{d.percentage}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ChartCard>
          </View>
        )}

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.muted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  gradeEmoji: {
    fontSize: 16,
  },
  gradeText: {
    ...typography.bodyMedium,
    color: colors.primary.default,
    fontWeight: '700',
  },
  statsGrid: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chartSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  barLabel: {
    ...typography.micro,
    color: colors.text.secondary,
    fontSize: 10,
    marginBottom: spacing.xxs,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterValue: {
    ...typography.h3,
    color: colors.text.primary,
  },
  pieCenterLabel: {
    ...typography.micro,
    color: colors.text.muted,
  },
  legend: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    minWidth: 60,
  },
  legendValue: {
    ...typography.captionMedium,
    color: colors.text.primary,
  },
});
