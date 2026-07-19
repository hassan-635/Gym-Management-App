/**
 * spacing.ts — Consistent spacing scale for Gym Progress Tracker
 * 
 * Uses a 4px base unit for consistent, harmonious spacing.
 * All UI elements should use these values for margins, paddings, gaps.
 */

export const spacing = {
  /** 2px — Micro spacing for tight inline elements */
  xxs: 2,
  /** 4px — Extra small spacing */
  xs: 4,
  /** 8px — Small spacing between related elements */
  sm: 8,
  /** 12px — Medium-small spacing */
  md: 12,
  /** 16px — Standard spacing for cards, sections */
  lg: 16,
  /** 20px — Large spacing between sections */
  xl: 20,
  /** 24px — Extra large spacing */
  xxl: 24,
  /** 32px — Section separation */
  xxxl: 32,
  /** 48px — Major section gaps */
  huge: 48,
} as const;

// ── Border Radius ──
export const borderRadius = {
  /** 4px — Small elements like badges */
  xs: 4,
  /** 8px — Buttons, small cards */
  sm: 8,
  /** 12px — Input fields */
  md: 12,
  /** 16px — Cards, containers */
  lg: 16,
  /** 20px — Large cards, modals */
  xl: 20,
  /** 24px — Extra large rounded elements */
  xxl: 24,
  /** Fully rounded (for circular elements) */
  full: 9999,
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
