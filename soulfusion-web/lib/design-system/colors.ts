/**
 * Soulfusion Design System - Colors
 *
 * Central color definitions shared across iOS and Web
 * All colors use exact HSL values to match iOS AppColors.swift
 *
 * iOS Reference: Soulfusion_IOS/Core/Theme/AppColors.swift
 */

export const brandColors = {
  // Primary Brand Colors

  /** Primary: Deep Purple
   *  HSL: 270 47% 17%
   *  Hex: #3C1642
   */
  primary: {
    h: 270,
    s: 47,
    l: 17,
    hex: '#3C1642',
    hsl: '270 47% 17%',
  },

  /** Secondary: Deep Teal/Turquoise
   *  HSL: 189 87% 24%
   *  Hex: #086375
   */
  secondary: {
    h: 189,
    s: 87,
    l: 24,
    hex: '#086375',
    hsl: '189 87% 24%',
  },

  /** Tertiary: Bright Teal
   *  HSL: 171 77% 47%
   *  Hex: #1DD3B0
   */
  tertiary: {
    h: 171,
    s: 77,
    l: 47,
    hex: '#1DD3B0',
    hsl: '171 77% 47%',
  },

  /** Highlight: Bright Green
   *  HSL: 84 79% 55%
   *  Hex: #A4E833
   */
  highlight: {
    h: 84,
    s: 79,
    l: 55,
    hex: '#A4E833',
    hsl: '84 79% 55%',
  },
} as const

export const semanticColors = {
  /** Success Green
   *  HSL: 122 39% 49%
   *  Hex: #4CAF50
   */
  success: {
    h: 122,
    s: 39,
    l: 49,
    hex: '#4CAF50',
    hsl: '122 39% 49%',
  },

  /** Warning Orange
   *  HSL: 45 93% 47%
   *  Hex: #FF9800
   */
  warning: {
    h: 45,
    s: 93,
    l: 47,
    hex: '#FF9800',
    hsl: '45 93% 47%',
  },

  /** Destructive Red
   *  HSL: 0 84% 60%
   *  Hex: #F44336
   */
  destructive: {
    h: 0,
    s: 84,
    l: 60,
    hex: '#F44336',
    hsl: '0 84% 60%',
  },
} as const

export const neutralColors = {
  /** Background (light mode)
   *  HSL: 220 20% 98%
   *  Hex: #F8F9FA
   */
  background: {
    h: 220,
    s: 20,
    l: 98,
    hex: '#F8F9FA',
    hsl: '220 20% 98%',
  },

  /** Card background */
  card: {
    hex: '#FFFFFF',
  },

  /** Text primary */
  textPrimary: {
    hex: '#222222',
  },

  /** Text secondary */
  textSecondary: {
    hex: '#666666',
  },

  /** Border */
  border: {
    hex: '#E0E0E0',
  },
} as const

export const darkColors = {
  /** Background (dark mode)
   *  HSL: 240 10% 5%
   *  Hex: #0D0D12
   */
  background: {
    h: 240,
    s: 10,
    l: 5,
    hex: '#0D0D12',
    hsl: '240 10% 5%',
  },

  /** Card (dark mode)
   *  HSL: 240 8% 12%
   *  Hex: #1A1A24
   */
  card: {
    h: 240,
    s: 8,
    l: 12,
    hex: '#1A1A24',
    hsl: '240 8% 12%',
  },

  /** Text primary (dark mode) */
  textPrimary: {
    hex: '#FFFFFF',
  },

  /** Text secondary (dark mode)
   *  Hex: #B3B3B3
   */
  textSecondary: {
    hex: '#B3B3B3',
  },

  /** Border (dark mode)
   *  Hex: #2A2A35
   */
  border: {
    hex: '#2A2A35',
  },
} as const

export const roleColors = {
  /** Help Seeker (Orange) */
  helpSeeker: '#FF9800',

  /** Helper (Green) */
  helper: '#4CAF50',

  /** Observer (Blue) */
  observer: '#2196F3',

  /** Neutral (Gray) */
  neutral: '#9E9E9E',
} as const

// Type exports for TypeScript
export type BrandColor = keyof typeof brandColors
export type SemanticColor = keyof typeof semanticColors
export type RoleColor = keyof typeof roleColors
