import { Platform } from 'react-native';

/**
 * StampCut is intentionally quieter than a social app. The palette borrows from
 * photo paper, graphite annotations, and the warm edge of an old print.
 */
export const Colors = {
  light: {
    background: '#F7F6F2',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceMuted: '#EEEBE5',
    text: '#25211E',
    textSecondary: '#706A64',
    textTertiary: '#948D85',
    border: '#DED9D1',
    borderStrong: '#C6BEB4',
    action: '#352D28',
    actionPressed: '#201B18',
    onAction: '#FFFCF8',
    accent: '#B98962',
    accentStrong: '#795237',
    accentSoft: '#EEE0D2',
    danger: '#A33E45',
    dangerSoft: '#F8E5E6',
    success: '#446B53',
    successSoft: '#E5EFE8',
    overlay: 'rgba(26, 22, 19, 0.46)',
    shadow: 'rgba(45, 35, 27, 0.14)',
    // Backwards-compatible aliases used by the Expo scaffold components.
    backgroundElement: '#EEEBE5',
    backgroundSelected: '#EEE0D2',
  },
  dark: {
    background: '#171513',
    surface: '#211E1B',
    surfaceRaised: '#292521',
    surfaceMuted: '#302C28',
    text: '#F6F1EA',
    textSecondary: '#C4BBB1',
    textTertiary: '#968D84',
    border: '#403A35',
    borderStrong: '#5A5149',
    action: '#E7D8C8',
    actionPressed: '#F5EADD',
    onAction: '#211B17',
    accent: '#D2A47D',
    accentStrong: '#E6BE9B',
    accentSoft: '#453528',
    danger: '#FF9CA1',
    dangerSoft: '#4A282B',
    success: '#9BC5A8',
    successSoft: '#263A2D',
    overlay: 'rgba(0, 0, 0, 0.66)',
    shadow: 'rgba(0, 0, 0, 0.42)',
    // Backwards-compatible aliases used by the Expo scaffold components.
    backgroundElement: '#302C28',
    backgroundSelected: '#453528',
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type Theme = (typeof Colors)[ThemeName];
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'Georgia, Cambria, "Times New Roman", serif',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    rounded: 'System',
    mono: 'monospace',
  },
})!;

export const Spacing = {
  none: 0,
  hairline: 1,
  half: 2,
  one: 4,
  xs: 6,
  two: 8,
  sm: 12,
  three: 16,
  md: 20,
  four: 24,
  lg: 28,
  five: 32,
  xl: 40,
  six: 64,
  xxl: 80,
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const TypeScale = {
  display: 42,
  title: 32,
  heading: 24,
  subheading: 19,
  body: 16,
  label: 14,
  caption: 12,
} as const;

export const Layout = {
  screenPadding: 20,
  maxContentWidth: 1120,
  maxReadingWidth: 620,
  minTouchTarget: 48,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = Layout.maxContentWidth;
