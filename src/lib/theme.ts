/**
 * Transrify Design System
 * Dark theme color palette, spacing, typography, and design tokens
 */

// Color Palette (Dark Theme)
export const colors = {
  // Backgrounds
  background: '#0B0B10',      // Screen background
  surface: '#15151E',         // Card/surface background
  card: '#15151E',            // Card background (same as surface)
  
  // Primary
  primary: '#7C4DFF',         // Primary actions, focus states
  primaryHover: '#6A3FE8',    // Pressed state
  primaryDisabled: '#4A2D99', // Disabled state
  
  // Text
  textPrimary: '#EDEDED',     // Primary text
  textSecondary: '#A0A0AE',   // Muted/secondary text
  textDisabled: '#5A5A66',    // Disabled text
  
  // Status
  error: '#FF5252',           // Error messages
  success: '#4CAF50',         // Success states
  warning: '#FFC107',         // Warning states
  
  // Borders
  border: '#2A2A35',          // Default borders
  borderFocus: '#7C4DFF',     // Focus state borders
  borderError: '#FF5252',     // Error state borders
} as const;

// Spacing Scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Border Radius Values
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

// Typography Styles
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
} as const;

// Export all theme constants
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
} as const;

export default theme;
