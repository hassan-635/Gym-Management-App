/**
 * components/common/Button.tsx — Animated button component
 * 
 * Supports primary, outline, and ghost variants with press feedback.
 * Uses Reanimated for smooth scale animation on press.
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useScalePress } from '../../hooks/useAnimations';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const { animatedStyle, onPressIn, onPressOut } = useScalePress();

  const containerStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`textVariant_${variant}`],
    styles[`textSize_${size}`],
  ];

  const iconColor = variant === 'primary' || variant === 'danger' || variant === 'success'
    ? colors.text.primary
    : variant === 'outline'
    ? colors.primary.default
    : colors.text.secondary;

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[containerStyles, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // ── Variants ──
  variant_primary: {
    backgroundColor: colors.primary.default,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary.default,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: colors.accent.danger,
  },
  variant_success: {
    backgroundColor: colors.accent.success,
  },

  // ── Sizes ──
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    minHeight: 56,
  },

  // ── Text ──
  text: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
  textVariant_primary: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  textVariant_outline: {
    color: colors.primary.default,
    fontWeight: '600',
  },
  textVariant_ghost: {
    color: colors.text.secondary,
  },
  textVariant_danger: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  textVariant_success: {
    color: colors.text.inverse,
    fontWeight: '600',
  },

  // ── Text Sizes ──
  textSize_sm: {
    fontSize: typography.sizes.sm,
  },
  textSize_md: {
    fontSize: typography.sizes.md,
  },
  textSize_lg: {
    fontSize: typography.sizes.lg,
  },

  // ── Icons ──
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
