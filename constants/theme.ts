export const Colors = {
  light: {
    // Surfaces
    surface: '#fff8f4',
    surfaceDim: '#e3d8ce',
    surfaceBright: '#fff8f4',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#fdf2e7',
    surfaceContainer: '#f7ece2',
    surfaceContainerHigh: '#f2e6dc',
    surfaceContainerHighest: '#ece1d7',
    onSurface: '#201b15',
    onSurfaceVariant: '#504537',
    inverseSurface: '#352f29',
    inverseOnSurface: '#faefe5',
    // Outlines
    outline: '#827565',
    outlineVariant: '#d4c4b2',
    // Primary – Deep Amber
    primary: '#633f00',
    onPrimary: '#ffffff',
    primaryContainer: '#835500',
    onPrimaryContainer: '#ffd197',
    inversePrimary: '#f9bb65',
    // Secondary – Cool Slate
    secondary: '#516071',
    onSecondary: '#ffffff',
    secondaryContainer: '#d1e1f5',
    onSecondaryContainer: '#556475',
    // Tertiary – Blue
    tertiary: '#004d6a',
    onTertiary: '#ffffff',
    tertiaryContainer: '#03668b',
    onTertiaryContainer: '#afe0ff',
    // Error
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    // Background
    background: '#fff8f4',
    onBackground: '#201b15',
    surfaceVariant: '#ece1d7',
    surfaceTint: '#835500',
    // Fixed
    primaryFixed: '#ffddb4',
    primaryFixedDim: '#f9bb65',
    // Legacy aliases for navigation/tab components
    text: '#201b15',
    tint: '#633f00',
    icon: '#504537',
    tabIconDefault: '#827565',
    tabIconSelected: '#633f00',
  },
  dark: {
    // Surfaces
    surface: '#18120c',
    surfaceDim: '#18120c',
    surfaceBright: '#3f3228',
    surfaceContainerLowest: '#120d07',
    surfaceContainerLow: '#201b15',
    surfaceContainer: '#252018',
    surfaceContainerHigh: '#2f281f',
    surfaceContainerHighest: '#3a3229',
    onSurface: '#ece1d7',
    onSurfaceVariant: '#d4c4b2',
    inverseSurface: '#ece1d7',
    inverseOnSurface: '#352f29',
    // Outlines
    outline: '#9d8b77',
    outlineVariant: '#504537',
    // Primary
    primary: '#f9bb65',
    onPrimary: '#352100',
    primaryContainer: '#4e3000',
    onPrimaryContainer: '#ffddb4',
    inversePrimary: '#835500',
    // Secondary
    secondary: '#b8c8dc',
    onSecondary: '#223040',
    secondaryContainer: '#394858',
    onSecondaryContainer: '#d4e4f8',
    // Tertiary
    tertiary: '#88cff9',
    onTertiary: '#00344a',
    tertiaryContainer: '#004c69',
    onTertiaryContainer: '#c4e7ff',
    // Error
    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
    // Background
    background: '#18120c',
    onBackground: '#ece1d7',
    surfaceVariant: '#504537',
    surfaceTint: '#f9bb65',
    // Fixed (same in both modes per MD3 spec)
    primaryFixed: '#ffddb4',
    primaryFixedDim: '#f9bb65',
    // Legacy aliases
    text: '#ece1d7',
    tint: '#f9bb65',
    icon: '#d4c4b2',
    tabIconDefault: '#9d8b77',
    tabIconSelected: '#f9bb65',
  },
} as const;

// Typography scale – Plus Jakarta Sans
// lineHeight and letterSpacing are in px (RN numeric values)
export const Typography = {
  displayLg: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 60,
    fontWeight: '700' as const,
    lineHeight: 66,
    letterSpacing: -1.2,
  },
  headlineLg: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
  },
  headlineMd: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
  },
  bodyLg: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 29,
  },
  bodyMd: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  labelSm: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 1.12,
  },
  caption: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 17,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  sectionGap: 80,
  marginMobile: 20,
  marginDesktop: 64,
  containerMaxWidth: 1280,
  gutter: 24,
  base: 8,
} as const;

// Border radius values in px (DESIGN.md uses rem; 1rem = 16px)
export const Radius = {
  sm: 4,    // 0.25rem
  md: 12,   // 0.75rem – buttons & inputs
  lg: 16,   // 1rem    – cards
  xl: 24,   // 1.5rem
  full: 9999,
} as const;

// Soft ambient shadow from DESIGN.md
export const Shadows = {
  card: {
    shadowColor: 'rgb(82, 69, 52)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
} as const;
