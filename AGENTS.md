# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot

Domilix is an Expo React Native app for real estate and furniture listings. The app targets Android, iOS, and web through Expo Router. The product language is French, the default market is Cameroon, and prices use XAF / FCFA.

Core stack:

- Expo SDK 54, React Native 0.81, React 19, TypeScript strict mode
- Expo Router 6 with typed routes enabled
- React Query for server state
- Zustand for client/auth/filter/create-listing state
- Axios API client with token refresh
- React Hook Form + Zod for forms
- Plus Jakarta Sans typography and a custom Material-style theme

## Commands

Use these npm scripts:

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
```

There is currently no test framework configured. When changing behavior, at minimum run `npm run lint` when feasible.

## Repository Map

- `app/` contains Expo Router routes and layouts.
- `app/(tabs)/` contains the main tab screens.
- `app/(auth)/` contains authentication flows.
- `app/(modals)/` contains modal routes.
- `app/announces/` and `app/announcers/` contain listing and advertiser detail/edit flows.
- `components/` contains reusable UI and feature components.
- `components/ui/` contains low-level UI primitives.
- `services/` contains API service modules.
- `hooks/queries/` contains React Query hooks.
- `stores/` contains Zustand stores.
- `providers/` contains app-level providers.
- `constants/` contains theme and app config.
- `types/` contains domain TypeScript types.
- `lib/` contains shared utilities, storage, token decoding, and validators.
- `interfacesHTML/` contains pixel-reference HTML mockups and screenshots.

## Coding Conventions

- Use TypeScript and keep strict-mode compatibility.
- Prefer the `@/` alias for project imports.
- Follow existing file and component naming patterns.
- Keep route files focused on screen composition; move reusable UI into `components/`.
- Do not introduce broad refactors while making a narrow feature or fix.
- Keep comments sparse and useful. Prefer clear names and small functions.
- Avoid adding manual `useMemo` or `useCallback` unless there is a measured performance reason. React Compiler is enabled.

## Routing

Routes are defined by files under `app/`.

- Use Expo Router `Link`, `router.push`, `router.replace`, and typed route-safe paths.
- Group folders such as `(tabs)` and `(auth)` are layout groups and do not add URL segments.
- Preserve existing auth behavior: unauthenticated users can browse many app surfaces, while protected actions/screens gate themselves.
- When adding a modal flow, prefer the existing `app/(modals)/` pattern.

## Data Fetching And API

- Use service modules in `services/` for HTTP calls.
- Use hooks in `hooks/queries/` for React Query integration.
- Use the shared Axios `client` from `services/api.client.ts`; it attaches bearer tokens and refreshes 401 responses.
- Do not call `axios` directly from screens/components unless there is a strong reason.
- Environment API base URL is `EXPO_PUBLIC_API_URL`; fallback is `https://api.domilix.com`.
- Keep API response normalization in services or query hooks, not scattered through UI components.

## State And Storage

- Use Zustand stores in `stores/` for client state that must be shared across screens.
- Use React Query for remote/server state.
- Use `TokenStorage` from `lib/secure-storage.ts` for auth tokens.
- Do not store secrets or tokens in plain AsyncStorage unless the existing auth/storage pattern explicitly does so.

## UI And Design

- Before implementing or changing a screen, check the matching reference in:

```text
interfacesHTML/stitch_domilix_mobile_app_ui_kit/<screen>/code.html
```

Each reference may include exact French labels, icon names, layout, shadows, and spacing.

Available screen references include:

- `accueil`
- `onboarding_1`
- `inscription`
- `explorer`
- `filtres_d_exploration`
- `d_tails_de_l_annonce_immobilier`
- `d_tails_de_l_annonce_mobilier`
- `mes_favoris`
- `notifications`
- `mon_profil`
- `profil_annonceur`
- `plans_d_abonnement`
- `vue_carte`

UI guidance:

- Prefer existing primitives from `components/ui/`.
- Use `ThemedText` and `ThemedView` when theme-aware text/surfaces are needed.
- Use `Colors`, `Typography`, `Spacing`, `Radius`, `Shadows`, and `Gradients` from `constants/theme.ts`.
- Keep French product copy consistent and natural.
- Respect portrait-first mobile layouts and safe areas.
- Keep Android edge-to-edge behavior in mind.

## Icons

- Cross-platform icon mapping lives in `components/ui/icon-symbol.tsx`.
- iOS uses `expo-symbols`; Android/web use `@expo/vector-icons`.
- When adding a symbol, update the mapping instead of hardcoding different icons in every component.
- The HTML references use Google Material Symbols; map the closest native equivalent through the app icon system.

## Forms And Validation

- Prefer React Hook Form and Zod for new forms.
- Keep validation schemas in `lib/validators/` when they are reused or domain-specific.
- Surface validation errors in French.
- Preserve existing form component patterns in `components/forms/`.

## Maps, Media, And Permissions

- Location permission text is configured in `app.json`.
- Use existing map components in `components/maps/` and listing map components where possible.
- Use existing media upload patterns in `components/forms/media-upload-grid.tsx`.
- Be careful with native-only modules when changing web behavior.

## Build And Config Notes

- `newArchEnabled` is true.
- `experiments.typedRoutes` and `experiments.reactCompiler` are true.
- Android package is `com.jack0237.domilix`.
- EAS project config is in `eas.json` and `app.json`.
- Do not commit generated APK files or local environment files.

## Quality Checklist

Before handing off substantial work:

- Run `npm run lint` if dependencies are installed and the change touches code.
- Check TypeScript route paths and imports.
- Verify UI changes against the matching HTML reference.
- Confirm loading, empty, error, and auth-gated states where relevant.
- Avoid regressions in dark mode if a component uses themed colors.

## Safety

- Never overwrite user changes without explicit permission.
- Do not expose `.env` values, API keys, tokens, or private service credentials.
- Keep generated assets, APKs, and large binaries out of source changes unless the user explicitly asks for them.
- Prefer small, reviewable changes that match the existing architecture.
