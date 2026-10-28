import { MD3DarkTheme, MD3LightTheme, configureFonts, type MD3Theme } from 'react-native-paper';

import { Colors, Fonts } from '@/constants/theme';

// Paper's MD3 variants carry a fontWeight ('400' or '500', never 700+, see
// fontWeight() in theme.ts); map each one to the
// Mona Sans family of that weight so Android does not fake the weight.
const fonts = configureFonts({
  config: Object.fromEntries(
    Object.entries(MD3LightTheme.fonts)
      .filter(([key]) => key !== 'default')
      .map(([key, font]) => {
        const weight = 'fontWeight' in font ? font.fontWeight : '400';
        return [key, { fontFamily: weight === '500' ? Fonts.medium : Fonts.regular }];
      }),
  ),
});

export const PaperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.primary,
    onPrimary: Colors.light.onPrimary,
    primaryContainer: Colors.light.primaryContainer,
    onPrimaryContainer: Colors.light.onPrimaryContainer,
    secondary: Colors.light.secondary,
    onSecondary: Colors.light.onSecondary,
    secondaryContainer: Colors.light.secondaryContainer,
    onSecondaryContainer: Colors.light.onSecondaryContainer,
    tertiary: Colors.light.tertiary,
    onTertiary: Colors.light.onTertiary,
    tertiaryContainer: Colors.light.tertiaryContainer,
    onTertiaryContainer: Colors.light.onTertiaryContainer,
    error: Colors.light.error,
    onError: Colors.light.onError,
    errorContainer: Colors.light.errorContainer,
    onErrorContainer: Colors.light.onErrorContainer,
    background: Colors.light.background,
    onBackground: Colors.light.onBackground,
    surface: Colors.light.surface,
    onSurface: Colors.light.onSurface,
    surfaceVariant: Colors.light.surfaceVariant,
    onSurfaceVariant: Colors.light.onSurfaceVariant,
    outline: Colors.light.outline,
    outlineVariant: Colors.light.outlineVariant,
    inverseSurface: Colors.light.inverseSurface,
    inverseOnSurface: Colors.light.inverseOnSurface,
    inversePrimary: Colors.light.inversePrimary,
    elevation: {
      level0: 'transparent',
      level1: Colors.light.surfaceContainerLow,
      level2: Colors.light.surfaceContainer,
      level3: Colors.light.surfaceContainerHigh,
      level4: Colors.light.surfaceContainerHigh,
      level5: Colors.light.surfaceContainerHighest,
    },
  },
};

export const PaperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.primary,
    onPrimary: Colors.dark.onPrimary,
    primaryContainer: Colors.dark.primaryContainer,
    onPrimaryContainer: Colors.dark.onPrimaryContainer,
    secondary: Colors.dark.secondary,
    onSecondary: Colors.dark.onSecondary,
    secondaryContainer: Colors.dark.secondaryContainer,
    onSecondaryContainer: Colors.dark.onSecondaryContainer,
    tertiary: Colors.dark.tertiary,
    onTertiary: Colors.dark.onTertiary,
    tertiaryContainer: Colors.dark.tertiaryContainer,
    onTertiaryContainer: Colors.dark.onTertiaryContainer,
    error: Colors.dark.error,
    onError: Colors.dark.onError,
    errorContainer: Colors.dark.errorContainer,
    onErrorContainer: Colors.dark.onErrorContainer,
    background: Colors.dark.background,
    onBackground: Colors.dark.onBackground,
    surface: Colors.dark.surface,
    onSurface: Colors.dark.onSurface,
    surfaceVariant: Colors.dark.surfaceVariant,
    onSurfaceVariant: Colors.dark.onSurfaceVariant,
    outline: Colors.dark.outline,
    outlineVariant: Colors.dark.outlineVariant,
    inverseSurface: Colors.dark.inverseSurface,
    inverseOnSurface: Colors.dark.inverseOnSurface,
    inversePrimary: Colors.dark.inversePrimary,
    elevation: {
      level0: 'transparent',
      level1: Colors.dark.surfaceContainerLow,
      level2: Colors.dark.surfaceContainer,
      level3: Colors.dark.surfaceContainerHigh,
      level4: Colors.dark.surfaceContainerHigh,
      level5: Colors.dark.surfaceContainerHighest,
    },
  },
};
