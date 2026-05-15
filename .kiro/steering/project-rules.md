---
inclusion: always
---

# Domilix — Agent Steering Rules

This document is the single source of truth for any AI agent working on this codebase. It is always loaded. Follow every rule here before writing, refactoring, or reviewing code.

---

## 1. Tech Stack (non-negotiable)

- **Expo ~54**, **React Native 0.81**, **TypeScript ~5.9** (strict mode — no `any`, no `ts-ignore`)
- **Expo Router ~6** for file-based routing (similar to Next.js App Router)
- **React 19** with React Compiler enabled — **never add `useMemo` or `useCallback` manually** unless you have a profiled benchmark proving it helps
- **react-native-reanimated ~4** for all animations; **react-native-gesture-handler ~2** for gestures
- New Architecture (`newArchEnabled: true`) and typed routes (`experiments.typedRoutes: true`) are **both active**

---

## 2. Project Structure

```
app/               ← File-based routes (Expo Router)
  _layout.tsx      ← Root Stack + ThemeProvider
  (tabs)/
    _layout.tsx    ← Bottom Tab Navigator
    index.tsx      ← Home tab
    explore.tsx    ← Explore tab
  modal.tsx        ← Accessible via <Link href="/modal">
components/
  ui/              ← Low-level UI primitives
  themed-text.tsx / themed-view.tsx
  parallax-scroll-view.tsx
hooks/
  use-color-scheme.ts / .web.ts  ← Always import from here, never from react-native
  use-theme-color.ts
constants/
  theme.ts         ← Colors (light/dark) and font constants
assets/images/     ← Use @2x/@3x suffixes for density variants
```

---

## 3. Routing Rules

- Routes come from the file tree under `app/`. Group folders like `(tabs)` add layouts without adding URL segments.
- Navigate with `<Link>` or `router.push()` from `expo-router`. Never use `navigation.navigate()`.
- Route names are type-checked — always use typed routes.

---

## 4. Theming Rules

- Always import `useColorScheme` from `@/hooks/use-color-scheme`, **never** from `react-native` directly (the `.web.ts` variant prevents SSR hydration bugs).
- Use `useThemeColor(props, colorName)` to resolve colors from `constants/theme.ts`.
- Prefer `ThemedText` / `ThemedView` over raw `Text` / `View` for any theme-sensitive UI.

---

## 5. Icons

- **iOS**: SF Symbols via `expo-symbols`
- **Android / Web**: `@expo/vector-icons` (MaterialIcons)
- Icon mapping is in [components/ui/icon-symbol.tsx](../../components/ui/icon-symbol.tsx). **Add every new icon** to the `MAPPING` object there.

---

## 6. Platform-Specific Files

- Use `.ios.tsx` / `.web.ts` / base file for platform splits — **not** `if (Platform.OS === ...)` checks, unless the difference is a single trivial value.
- Expo resolves the right variant at build time.

---

## 7. Path Aliases

Always use `@/` for non-relative imports:

```ts
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
```

Never use deep relative paths (`../../..`).

---

## 8. Design System — Domilix Editorial

The aesthetic is **"Confident Premium" / Editorial Minimalism**. Target audience: discerning real-estate and furniture buyers in Douala and Yaoundé. The UI must feel curated, warm, and authoritative — never cluttered or tech-bro.

### 8.1 Color Palette

Use these tokens from `constants/theme.ts`. Never hardcode hex values inline.

| Role | Token | Value |
|---|---|---|
| Background / Surface | `surface` | `#fff8f4` |
| Page Background | `background` | `#fff8f4` |
| Card / Grouped Content | `surface-container` | `#f7ece2` |
| Primary Brand | `primary` | `#633f00` (Deep Amber) |
| CTA only | `primary-container` | `#835500` (Bright Orange) |
| Body Text | `on-surface` | `#201b15` |
| Muted Text | `on-surface-variant` | `#504537` |
| Border Default | `outline-variant` | `#d4c4b2` |
| Border Emphasis | `outline` | `#827565` |
| Error | `error` | `#ba1a1a` |
| Secondary (utility) | `secondary` | `#516071` |
| Tertiary (furniture / info) | `tertiary` | `#004d6a` |

**Primary-container (Bright Orange) is reserved exclusively for "Contacter l'agent" and "Réserver" CTAs.** Never use it for decorative purposes.

### 8.2 Typography — Plus Jakarta Sans

All text uses `Plus Jakarta Sans`. Never substitute another font family.

| Scale | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| `display-lg` | 60px | 700 | 1.1 | -0.02em |
| `headline-lg` | 40px | 700 | 1.2 | — |
| `headline-md` | 32px | 700 | 1.2 | — |
| `body-lg` | 18px | 400 | 1.6 | — |
| `body-md` | 16px | 400 | 1.6 | — |
| `label-sm` | 14px | 600 | 1 | 0.08em |
| `caption` | 12px | 500 | 1.4 | — |

- Headlines must feel "locked" — use tight line height and slight negative letter spacing for Display/Headline scales.
- `label-sm` is for metadata badges ("DISPONIBLE", "VENDU", "Nouveau"). Always track it out (0.08em) for the premium architectural feel.
- UI language is **formal French**: "Découvrir la collection" not "Voir plus".

### 8.3 Spacing

- Base unit: **8px**. All spacing is a multiple of 8.
- Mobile side margin: **20px**
- Desktop side margin: **64px** (max-width 1280px)
- Section vertical gap: **80px+** — never crowd sections. Generous whitespace is a feature, not wasted space.

### 8.4 Elevation & Depth

Use **tonal layering** and **ambient shadows** — never harsh dark shadows.

- Place `surface-container` (Cream) content on `surface` (Warm White) for a "paper-on-table" effect.
- Floating card shadow: `0px 10px 20px rgba(82, 69, 52, 0.04)` — warm-tinted, not grey.
- On hover/press, darken the 1px border to `outline` strength — do **not** increase elevation.

### 8.5 Border Radius

| Element | Radius |
|---|---|
| Buttons & Inputs | 12px |
| Cards | 16px |
| Avatars | 9999px (circle) |
| Tags / Chips | 9999px (pill) |

### 8.6 Component Specifications

**Buttons**
- Primary: `primary` background (`#633f00`), white text, 12px radius
- CTA: `primary-container` background (`#835500`), only for booking/contact actions
- Ghost: 1px `outline-variant` border, `on-surface` text

**Input Fields**
- Default: 1px `outline-variant` border, 12px radius, `surface` background
- Focus: 2px `primary` border, floating label in `label-sm` style

**Cards (Property / Furniture)**
- 16px radius, soft ambient shadow
- Image occupies top 60% of card
- Content area uses `surface-container` when placed on `surface`

**Status Chips**
- Use `label-sm` typography, always tracked
- Background: `secondary` or `tertiary` at 10% opacity, full-strength text

**Navigation**
- Uppercase `label-sm` for nav items
- Keep navigation airy — no visual clutter

---

## 9. React & Component Rules

### 9.1 No Boolean Prop Proliferation

Never accumulate boolean props (`isThread`, `isEditing`, `isModal`) on a single component. Each boolean doubles possible states and creates unmaintainable conditional logic. Use **composition and explicit variant components** instead.

```tsx
// WRONG
<Card isListing isEditable isFeatured showPrice={false} />

// RIGHT
<FeaturedListingCard />
<EditableListingCard />
```

### 9.2 Compound Components with Shared Context

For complex UI, use compound components with a shared context provider. Subcomponents read state via `use(Context)`, not props.

```tsx
const Listing = {
  Provider: ListingProvider,
  Image: ListingImage,
  Title: ListingTitle,
  Price: ListingPrice,
  CTAButton: ListingCTAButton,
}
```

### 9.3 Lift State into Providers

State shared between sibling components belongs in a provider, not synced via `useEffect` or refs passed as props.

### 9.4 React 19 APIs

- **No `forwardRef`** — `ref` is now a plain prop in React 19
- Use `use(Context)` instead of `useContext(Context)` — `use()` can be called conditionally
- No manual `useMemo` / `useCallback` — the React Compiler handles memoization

### 9.5 Composition Over Render Props

Prefer `children` for layout composition. Use render props only when the parent must pass data back to the child (e.g., virtualized lists).

### 9.6 State Decoupled from UI

UI components consume a context interface — they must not know whether state comes from `useState`, Zustand, or a server sync. Providers own the implementation details.

---

## 10. Async Patterns

- Run independent async operations in parallel with `Promise.all`, never sequentially by accident.
- Put cheap synchronous checks before any `await`.
- Wrap async boundaries in `<Suspense>` with meaningful fallbacks.

---

## 11. Accessibility

- Every interactive element must have an `accessibilityLabel` and `accessibilityRole`.
- Touch targets must be at least **44×44pt**.
- Use semantic structure: headings map to `accessibilityRole="header"`, buttons to `"button"`.
- Ensure sufficient color contrast: body text on `surface` must meet WCAG AA (4.5:1 minimum).
- Never convey information through color alone — pair color with a text label or icon.

---

## 12. Code Style

- TypeScript strict mode. No `any`. No `ts-ignore`.
- No comments unless the **why** is non-obvious (hidden constraint, subtle invariant, workaround for a specific bug).
- No trailing summaries or changelog comments in code.
- `@/` path alias for all non-relative imports.
- File names: `kebab-case.tsx`
- Component names: `PascalCase`
- Hooks: `use-kebab-case.ts`

---

## 13. What to Avoid

| Avoid | Use instead |
|---|---|
| `import { useColorScheme } from 'react-native'` | `import { useColorScheme } from '@/hooks/use-color-scheme'` |
| Hardcoded hex colors | Theme tokens from `constants/theme.ts` |
| `useMemo` / `useCallback` without a benchmark | React Compiler (automatic) |
| `forwardRef` | Plain `ref` prop (React 19) |
| `useContext(X)` | `use(X)` |
| `Platform.OS` branches for full-screen differences | Platform-split file variants |
| Boolean prop accumulation | Explicit variant components |
| Render props for layout | `children` composition |
| Harsh `rgba(0,0,0,0.x)` shadows | Warm ambient shadow `rgba(82,69,52,0.04)` |
| Casual French ("Voir plus") | Formal French ("Découvrir la collection") |
