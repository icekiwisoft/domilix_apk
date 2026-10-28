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
    // Sign-in and sign-up screens (UI-01, UI-02). The main button uses dark text
    // on a lighter amber: white on #e8921a only reaches ~2.5:1 (fails AA).
    cta: '#f5a623',
    onCta: '#291800',
    link: '#835500',
    fieldSurface: '#ffffff',
    fieldPrefix: '#fff1e4',
    success: '#2f6b3a',
    // Badge over the mascot photo: same light chip in both themes.
    bannerChip: 'rgba(255,255,255,0.94)',
    onBannerChip: '#211a12',
    // Google sign-in button, Google's official colours (light theme).
    googleSurface: '#ffffff',
    googleOutline: '#747775',
    onGoogleSurface: '#1f1f1f',
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
    // Sign-in and sign-up screens (UI-01, UI-02)
    cta: '#ffb955',
    onCta: '#291800',
    link: '#ffb955',
    fieldSurface: '#221b14',
    fieldPrefix: '#2c241b',
    success: '#8fd19e',
    bannerChip: 'rgba(255,255,255,0.94)',
    onBannerChip: '#211a12',
    // Google sign-in button, Google's official colours (dark theme).
    googleSurface: '#131314',
    googleOutline: '#8e918f',
    onGoogleSurface: '#e3e3e3',
  },
} as const;

// Mona Sans, the website's typeface (domilix.com tailwind.config.mjs fontFamily.sans).
// These are the family names registered by useFonts in app/_layout.tsx: on Android a
// custom font needs one family per weight, so always pick the family that matches the
// weight instead of relying on fontWeight alone.
export const Fonts = {
  regular: 'MonaSans_400Regular',
  medium: 'MonaSans_500Medium',
  semiBold: 'MonaSans_600SemiBold',
  bold: 'MonaSans_700Bold',
} as const;

// Typography scale – Mona Sans
// lineHeight and letterSpacing are in px (RN numeric values)
export const Typography = {
  displayLg: {
    fontFamily: Fonts.bold,
    fontSize: 60,
    fontWeight: '700' as const,
    lineHeight: 66,
    letterSpacing: -1.2,
  },
  headlineLg: {
    fontFamily: Fonts.bold,
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
  },
  headlineMd: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
  },
  headlineSm: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 29,
  },
  bodyMd: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  labelSm: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 1.12,
  },
  // Screen title of the sign-in and sign-up screens
  titleLg: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.26,
  },
  // Field labels and small links
  labelMd: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  // Helper text under a field
  helper: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontFamily: Fonts.medium,
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
  banner: 28, // bottom corners of the sign-in mascot banner
  full: 9999,
} as const;

// Fixed component sizes (dp)
export const Sizes = {
  touchTarget: 48, // minimum touch target (Material 3, WCAG)
  control: 52, // text fields and full-width buttons on the sign-in screens
  authBannerTall: 236, // mascot banner, sign-in
  authBannerShort: 148, // mascot banner, sign-up
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
