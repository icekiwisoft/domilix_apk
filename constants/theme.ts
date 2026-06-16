export const Colors = {
  light: {
    // Surfaces
    surface: '#fff8f4',
    surfaceDim: '#e7d7ca',
    surfaceBright: '#fff8f4',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#fff1e6',
    surfaceContainer: '#fbebde',
    surfaceContainerHigh: '#f5e5d8',
    surfaceContainerHighest: '#f0e0d3',
    onSurface: '#221a12',
    onSurfaceVariant: '#534435',
    inverseSurface: '#382f26',
    inverseOnSurface: '#feeee1',
    // Outlines
    outline: '#867462',
    outlineVariant: '#d9c3af',
    // Primary – Warm Amber/Orange
    primary: '#e8921a',
    onPrimary: '#ffffff',
    primaryContainer: '#885200',
    onPrimaryContainer: '#ffffff',
    inversePrimary: '#ffb869',
    // Secondary – Cool Slate
    secondary: '#516071',
    onSecondary: '#ffffff',
    secondaryContainer: '#d1e1f5',
    onSecondaryContainer: '#556475',
    // Tertiary – Teal
    tertiary: '#01658a',
    onTertiary: '#ffffff',
    tertiaryContainer: '#66aed6',
    onTertiaryContainer: '#004059',
    // Error
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    // Background
    background: '#fff8f4',
    onBackground: '#221a12',
    surfaceVariant: '#f0e0d3',
    surfaceTint: '#885200',
    // Fixed
    primaryFixed: '#ffdcbb',
    primaryFixedDim: '#ffb869',
    // Legacy aliases for navigation/tab components
    text: '#221a12',
    tint: '#885200',
    icon: '#534435',
    tabIconDefault: '#867462',
    tabIconSelected: '#885200',
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
    onSurface: '#feeee1',
    onSurfaceVariant: '#d9c3af',
    inverseSurface: '#f0e0d3',
    inverseOnSurface: '#382f26',
    // Outlines
    outline: '#9d8b77',
    outlineVariant: '#534435',
    // Primary
    primary: '#ffb869',
    onPrimary: '#2b1700',
    primaryContainer: '#885200',
    onPrimaryContainer: '#ffdcbb',
    inversePrimary: '#e8921a',
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
    onBackground: '#feeee1',
    surfaceVariant: '#534435',
    surfaceTint: '#ffb869',
    // Fixed
    primaryFixed: '#ffdcbb',
    primaryFixedDim: '#ffb869',
    // Legacy aliases
    text: '#feeee1',
    tint: '#ffb869',
    icon: '#d9c3af',
    tabIconDefault: '#867462',
    tabIconSelected: '#ffb869',
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
  headlineSm: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
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

// Shadow system — amber-tinted ambient shadows
export const Shadows = {
  xs: {
    shadowColor: 'rgb(82, 69, 52)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: 'rgb(82, 69, 52)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  md: {
    shadowColor: 'rgb(99, 63, 0)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  button: {
    shadowColor: 'rgb(99, 63, 0)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: 'rgb(82, 69, 52)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 8,
  },
} as const;

// Gradient stops for image overlays
export const Gradients = {
  imageOverlay: ['transparent', 'rgba(34,26,18,0.55)'],
  imageOverlayStrong: ['transparent', 'rgba(34,26,18,0.80)'],
  primaryFade: ['rgba(136,82,0,0)', 'rgba(136,82,0,0.08)'],
} as const;
