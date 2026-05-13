# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start            # Start Expo dev server (press i/a/w to open on iOS/Android/Web)
npm run ios          # Launch on iOS simulator
npm run android      # Launch on Android emulator
npm run web          # Launch in browser
npm run lint         # Run ESLint via expo lint
npm run reset-project  # Wipe starter screens; moves them to app-example/
```

No test framework is configured yet.

## Stack

- **Expo ~54** with **React Native 0.81** and **TypeScript ~5.9** (strict mode)
- **Expo Router ~6** — file-based routing (similar to Next.js App Router)
- **React 19** with React Compiler enabled (automatic memoization — do not add manual `useMemo`/`useCallback` unless benchmarked)
- **react-native-reanimated ~4** for animations; **react-native-gesture-handler ~2** for gestures
- New Architecture (`newArchEnabled: true`) and typed routes (`experiments.typedRoutes: true`) are both on

## Project Structure

```
app/               # File-based routes (Expo Router)
  _layout.tsx      # Root Stack + ThemeProvider setup
  (tabs)/
    _layout.tsx    # Bottom Tab Navigator (two tabs)
    index.tsx      # Home tab
    explore.tsx    # Explore tab
  modal.tsx        # Modal screen (accessible via Link to "/modal")
components/
  ui/              # Low-level UI primitives
  themed-text.tsx / themed-view.tsx   # Theme-aware wrappers
  parallax-scroll-view.tsx            # Animated parallax header
hooks/
  use-color-scheme.ts / .web.ts       # Platform-split hydration-safe hook
  use-theme-color.ts                  # Resolves color from theme + per-component overrides
constants/
  theme.ts         # Colors (light/dark) and font constants
assets/images/     # Icons and splash; use @2x/@3x suffixes for density variants
```

## Routing

Routes are defined by the file tree under `app/`. Group folders like `(tabs)` create layouts without adding URL segments. Navigate with the `<Link>` component or `router.push()` from `expo-router`. Route names are type-checked when `experiments.typedRoutes` is on.

## Theming

- `useColorScheme()` (from `hooks/use-color-scheme`) returns `"light"` or `"dark"`; the `.web.ts` variant guards against SSR hydration mismatches — always import from `@/hooks/use-color-scheme`, not directly from `react-native`
- `useThemeColor(props, colorName)` resolves a color name from `constants/theme.ts` with optional per-component light/dark overrides
- Prefer `ThemedText` / `ThemedView` over plain `Text` / `View` for theme-aware UI

## Icons

- **iOS**: SF Symbols via `expo-symbols`
- **Android / Web**: `@expo/vector-icons` (MaterialIcons)
- The mapping between the two is maintained in [components/ui/icon-symbol.tsx](components/ui/icon-symbol.tsx). When adding a new icon, add an entry to the `MAPPING` object in that file.

## Platform-Specific Files

Expo resolves platform-specific variants automatically:
- `.ios.tsx` is used on iOS, `.web.ts` on web, base file is the fallback
- Use this pattern (not runtime `Platform.OS` checks) when the implementation differs significantly between platforms

## Path Alias

`@/` maps to the repository root. Use it for all non-relative imports:

```ts
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
```
