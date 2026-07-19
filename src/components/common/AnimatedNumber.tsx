/**
 * components/common/AnimatedNumber.tsx — Smooth number counter animation
 * 
 * Animates a number from 0 to the target value on mount.
 * Used for stats display to create an engaging counting effect.
 */
import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { colors, typography } from '../../theme';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: StyleProp<TextStyle>;
  formatter?: (value: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
  formatter,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatted = formatter
    ? formatter(displayValue)
    : displayValue.toFixed(decimals);

  return (
    <Text style={[defaultStyle, style]}>
      {prefix}{formatted}{suffix}
    </Text>
  );
};

const defaultStyle: TextStyle = {
  ...typography.numberLarge,
  color: colors.text.primary,
};
