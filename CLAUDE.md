# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Detailed coding conventions live in [AGENTS.md](AGENTS.md); read it too.

## Product

Domilix is a marketplace for housing and furniture listings in Cameroon (French copy, prices in XAF / FCFA), aimed at students, young workers and middle-class families. This repo is the Expo mobile app (Android first, package `com.jack0237.domilix`). The website and the API live in another repo, `icekiwisoft/domilix`, cloned at `~/Documents/GitHub/domilix`:

- `domilix.com/`: the website (Next.js + Tailwind). **It is the reference for the brand identity** (https://domilix.com/fr/houses): colors, typography, iconography, copy and formats. Design tokens are in `domilix.com/tailwind.config.mjs`, copy in `domilix.com/messages/`. Layouts are adapted to mobile, not copied from the desktop site.
- `backend/`: the NestJS + Prisma + JWT backend behind `https://api.domilix.com`. **Read-only from this repo**: read it to learn the real API contract (controllers, DTOs, services, `prisma/schema.prisma`), never change it. Server-side needs are listed for its maintainers.

## Commands

```bash
npm start              # Expo dev server
npm run android        # Run on a connected device / emulator
npm run lint           # expo lint
npx tsc --noEmit       # Type check
```

No test framework is configured yet. CI: `.github/workflows/build-apk.yml` (EAS local build, `preview` profile → APK).

## Stack

Expo SDK 54, React Native 0.81, React 19 with React Compiler (no manual `useMemo`/`useCallback` without a measured reason), TypeScript strict, Expo Router 6 (typed routes), New Architecture. React Query for server state, Zustand for client state, Axios client with token refresh, React Hook Form + Zod, Firebase Auth (Google sign-in), react-native-maps, expo-image.

## Layout

```
app/                    Expo Router routes
  (tabs)/               index (home), explore/ (list + map), notifications, favorites, profile/
  (auth)/               login, register, verify-phone, forgot/reset password
  (modals)/             filter-sheet, unlock-confirm
  announces/            [id] detail, create/step-1..5, edit/[id]
  announcers/[id]       advertiser page
  profile/              edit, my-listings, settings, subscriptions, announcer-profile
components/             feature components (listing, search, maps, forms, auth, home…)
components/ui/          primitives (button, input, chip, badge, skeleton, toast, bottom-sheet, empty-state…)
services/               HTTP modules on the shared client `services/api.client.ts`
hooks/queries/          React Query hooks
stores/                 Zustand stores (auth, filters, create-listing, theme, ui)
providers/              auth, query, theme providers
constants/theme.ts      Colors, Typography, Spacing, Radius, Shadows, Gradients (single source of design values)
lib/                    secure storage (tokens), token decoding, validators, Firebase
types/                  domain types
informations/           requirements, architecture guide, release optimisation notes
interfacesHTML/         older Stitch mockups (secondary reference; the website wins when they differ)
```

## Rules that matter most

- **Design values only from `constants/theme.ts`**, kept in sync with the website's Tailwind tokens. No ad hoc colors, sizes or radii in screens.
- **Every screen touched is also improved for usability**: platform conventions (Material 3 on Android), touch targets ≥ 48 dp, WCAG AA contrast, loading/empty/error/offline states, readable at 200 % font size, TalkBack labels, few taps for key journeys.
- **Never write to the production API while developing or testing** (listings, unlocks, subscriptions, payments, SMS): it serves real users. Use a local backend (`docker compose up` in `~/Documents/GitHub/domilix`) for write flows.
- Ask permissions in context, with a fallback when refused. Use `useRouter()` rather than the global `router` object.
- The app is not done until a **release build** has been installed and launched on a device (`logcat -b crash` empty).
- Never commit `.env`, keystores, `android/`/`ios/`, APK/AAB files or personal data (the repo is public).

## Git

Shared organisation repo. One branch per batch from `develop`, pull request to `develop`; never push to `main`/`master` or rewrite shared history.

### Commits

Follow the existing history: short conventional subjects in English (`fix(listing): …`, `feat(explore): …`, `ci: …`, `docs: …`), with the backlog entry id when there is one (`(B-03)`), and a body that explains why.

## Agent team

Sub-agent roles live in `.claude/agents/` (product-analyst, developer, code-reviewer, ux-reviewer, qa-tester, devops-release) and the `/dev-team` skill in `.claude/skills/dev-team/` orchestrates them. Work items are tracked in `docs/BACKLOG.md`. **Every agent reads [docs/LECONS-EQUIPE.md](docs/LECONS-EQUIPE.md) first**: Domilix-specific rules, lessons from real mistakes, and the Expo/Android knowledge (notifications, permissions, cache, SQLite sync, battery, release builds).

Test devices: the user's Pixel 9 (`48150DLAQ003HE`, personal phone: check the foreground app before any screenshot) and `emulator-5554`. `adb` is in `~/Android/Sdk/platform-tools/`.
