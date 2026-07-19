/**
 * colors.ts — Dark theme color palette for Gym Progress Tracker
 * 
 * Design philosophy: Deep dark backgrounds with vibrant purple/teal accents.
 * Uses HSL-based colors for consistency and premium feel.
 */

export const colors = {
  // ── Background Hierarchy ──
  background: {
    primary: '#0A0A0F',    // Deepest dark — main screen background
    secondary: '#12121A',  // Card backgrounds
    tertiary: '#1A1A2E',   // Surface elements, inputs
    elevated: '#1E1E32',   // Elevated cards, modals
  },

  // ── Brand Colors ──
  primary: {
    default: '#6C63FF',    // Vibrant purple — main brand color
    light: '#7B73FF',      // Lighter variant for hover/active
    dark: '#5A52E0',       // Darker variant for pressed states
    muted: 'rgba(108, 99, 255, 0.15)', // Subtle tint for backgrounds
    glow: 'rgba(108, 99, 255, 0.3)',   // Glow effects
  },

  // ── Accent Colors ──
  accent: {
    success: '#00D4AA',    // Teal green — completion, checkmarks
    successMuted: 'rgba(0, 212, 170, 0.15)',
    warning: '#FFB74D',    // Amber — timer, rest periods
    warningMuted: 'rgba(255, 183, 77, 0.15)',
    danger: '#FF5252',     // Red — delete, danger actions
    dangerMuted: 'rgba(255, 82, 82, 0.15)',
    info: '#64B5F6',       // Light blue — informational
    infoMuted: 'rgba(100, 181, 246, 0.15)',
  },

  // ── Text Colors ──
  text: {
    primary: '#FFFFFF',      // Main text
    secondary: '#B0B0C0',   // Secondary/descriptive text
    muted: '#6B6B80',       // Disabled/placeholder text
    inverse: '#0A0A0F',     // Text on light backgrounds
  },

  // ── Border Colors ──
  border: {
    default: 'rgba(255, 255, 255, 0.06)',  // Subtle borders
    active: 'rgba(108, 99, 255, 0.3)',     // Active/focused borders
    light: 'rgba(255, 255, 255, 0.1)',     // Slightly visible borders
  },

  // ── Gradient Presets ──
  gradient: {
    primary: ['#6C63FF', '#7B73FF'] as const,
    success: ['#00D4AA', '#00E5B8'] as const,
    warning: ['#FFB74D', '#FFC877'] as const,
    dark: ['#12121A', '#0A0A0F'] as const,
  },

  // ── Muscle Group Colors (for charts & badges) ──
  muscleGroups: {
    Chest: '#FF6B6B',
    Back: '#4ECDC4',
    Shoulders: '#FFE66D',
    Legs: '#6C63FF',
    Arms: '#FF8A5C',
    Core: '#A8E6CF',
  } as Record<string, string>,

  // ── Overlay ──
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // ── Tab Bar ──
  tabBar: {
    background: '#0F0F17',
    active: '#6C63FF',
    inactive: '#6B6B80',
  },
} as const;

// Type for theme colors
export type Colors = typeof colors;
