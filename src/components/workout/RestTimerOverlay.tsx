/**
 * components/workout/RestTimerOverlay.tsx — Full-screen rest timer
 * 
 * Animated overlay that appears during rest between sets.
 * Shows circular countdown, remaining time, and controls.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useRestTimer } from '../../hooks/useRestTimer';
import { formatTimerDisplay } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;

export const RestTimerOverlay: React.FC = () => {
  const timer = useRestTimer();

  if (!timer.isVisible) return null;

  const timeDisplay = formatTimerDisplay(timer.remainingSeconds);
  const progressPercent = Math.round(timer.progress * 100);

  // Pulsing animation when timer is complete
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(timer.isCompleted ? 1.05 : 1, {
          damping: 8,
          stiffness: 100,
        }),
      },
    ],
  }));

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Timer Title */}
        <Text style={styles.title}>
          {timer.isCompleted ? 'Rest Complete! 💪' : 'Rest Timer'}
        </Text>

        {/* Circular Timer Display */}
        <Animated.View style={[styles.circleContainer, pulseStyle]}>
          <View
            style={[
              styles.circle,
              timer.isCompleted && styles.circleCompleted,
            ]}
          >
            {/* Time Display */}
            <Text style={[styles.timeText, timer.isCompleted && styles.completedTimeText]}>
              {timeDisplay}
            </Text>
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controls}>
          {timer.isRunning ? (
            <TouchableOpacity onPress={timer.pauseTimer} style={styles.controlButton}>
              <Ionicons name="pause" size={28} color={colors.text.primary} />
              <Text style={styles.controlLabel}>Pause</Text>
            </TouchableOpacity>
          ) : !timer.isCompleted ? (
            <TouchableOpacity onPress={timer.resumeTimer} style={styles.controlButton}>
              <Ionicons name="play" size={28} color={colors.accent.success} />
              <Text style={styles.controlLabel}>Resume</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={timer.resetTimer} style={styles.controlButton}>
            <Ionicons name="refresh" size={28} color={colors.accent.warning} />
            <Text style={styles.controlLabel}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={timer.hideTimer} style={styles.controlButton}>
            <Ionicons name="close" size={28} color={colors.accent.danger} />
            <Text style={styles.controlLabel}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Skip Button */}
        {!timer.isCompleted && (
          <TouchableOpacity onPress={timer.hideTimer} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip Rest</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xxxl,
  },
  circleContainer: {
    marginBottom: spacing.xxxl,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 4,
    borderColor: colors.accent.warning,
    backgroundColor: colors.accent.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    borderColor: colors.accent.success,
    backgroundColor: colors.accent.successMuted,
  },
  timeText: {
    ...typography.display,
    color: colors.accent.warning,
    fontSize: 56,
    lineHeight: 64,
  },
  completedTimeText: {
    color: colors.accent.success,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  controlButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  controlLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  skipText: {
    ...typography.bodyMedium,
    color: colors.text.muted,
    textDecorationLine: 'underline',
  },
});
