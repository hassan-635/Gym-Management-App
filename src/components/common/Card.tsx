/**
 * components/common/Card.tsx — Glassmorphic card container
 * 
 * Reusable card with subtle border glow and dark glass effect.
 * Supports pressable and non-pressable variants.
 */
import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../theme';
import { useScalePress } from '../../hooks/useAnimations';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const { animatedStyle, onPressIn, onPressOut } = useScalePress(0.98);

  const containerStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`padding_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        style={[containerStyles, animatedStyle]}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  // ── Variants ──
  variant_default: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  variant_elevated: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  variant_outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  variant_glow: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.primary.glow,
    shadowColor: colors.primary.default,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  // ── Padding ──
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: spacing.md,
  },
  padding_md: {
    padding: spacing.lg,
  },
  padding_lg: {
    padding: spacing.xl,
  },
});
