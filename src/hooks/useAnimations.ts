/**
 * hooks/useAnimations.ts — Shared animation configurations
 * 
 * Provides reusable Reanimated animation presets for consistent
 * motion design across the app.
 */
import {
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Easing,
  SharedValue,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';
import { ANIMATION } from '../utils/constants';

// ── Spring Configurations ──
export const SPRING_CONFIGS = {
  /** Gentle spring for subtle movements */
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 0.5,
  } as WithSpringConfig,
  
  /** Bouncy spring for playful interactions */
  bouncy: {
    damping: 10,
    stiffness: 150,
    mass: 0.8,
  } as WithSpringConfig,

  /** Snappy spring for quick responses */
  snappy: {
    damping: 15,
    stiffness: 200,
    mass: 0.3,
  } as WithSpringConfig,

  /** Default spring from constants */
  default: ANIMATION.SPRING_CONFIG as WithSpringConfig,
};

// ── Timing Configurations ──
export const TIMING_CONFIGS = {
  fast: {
    duration: ANIMATION.FAST,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,

  normal: {
    duration: ANIMATION.NORMAL,
    easing: Easing.inOut(Easing.cubic),
  } as WithTimingConfig,

  slow: {
    duration: ANIMATION.SLOW,
    easing: Easing.inOut(Easing.cubic),
  } as WithTimingConfig,
};

/**
 * Hook for fade-in animation on mount.
 * Returns animated style with opacity transition.
 */
export const useFadeIn = (delay: number = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animate = () => {
    setTimeout(() => {
      opacity.value = withTiming(1, TIMING_CONFIGS.normal);
      translateY.value = withSpring(0, SPRING_CONFIGS.gentle);
    }, delay);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle, animate, opacity, translateY };
};

/**
 * Hook for scale press feedback animation.
 * Returns animated style and press handlers.
 */
export const useScalePress = (scaleDown: number = 0.96) => {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(scaleDown, SPRING_CONFIGS.snappy);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIGS.bouncy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
};

/**
 * Hook for staggered list item animations.
 * Each item fades in and slides up with a delay based on index.
 */
export const useStaggeredEntry = (index: number, staggerDelay: number = 50) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  const animate = () => {
    const delay = index * staggerDelay;
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(0, SPRING_CONFIGS.gentle);
    }, delay);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle, animate };
};
