/**
 * typography.ts — Typography system for Gym Progress Tracker
 * 
 * Uses system font (San Francisco on iOS, Roboto on Android) for
 * optimal readability and native feel. Defines consistent text styles.
 */
import { TextStyle, Platform } from 'react-native';

// ── Font Weights ──
const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  heavy: '800' as TextStyle['fontWeight'],
};

// ── Font Sizes ──
const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

// ── Pre-built Text Styles ──
export const typography = {
  // Display — Large hero numbers (stats, timers)
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.heavy,
    lineHeight: 48,
    letterSpacing: -1,
  } as TextStyle,

  // Heading 1 — Screen titles
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,

  // Heading 2 — Section titles
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,

  // Heading 3 — Card titles, group headers
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
    letterSpacing: 0,
  } as TextStyle,

  // Body Large — Primary content text
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  // Body — Standard text
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  // Body Medium — Emphasized body text
  bodyMedium: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  // Caption — Small labels, metadata
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 18,
    letterSpacing: 0.1,
  } as TextStyle,

  // Caption Medium — Emphasized captions
  captionMedium: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 18,
    letterSpacing: 0.1,
  } as TextStyle,

  // Micro — Tiny labels, badges
  micro: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,

  // Number — Numeric displays (weights, reps, sets)
  number: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: 28,
    letterSpacing: 0,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  } as TextStyle,

  // Numeric Large — Big numeric displays
  numberLarge: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.heavy,
    lineHeight: 40,
    letterSpacing: -0.5,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  } as TextStyle,

  // ── Raw values for custom usage ──
  sizes: fontSizes,
  weights: fontWeights,
} as const;

export type Typography = typeof typography;
