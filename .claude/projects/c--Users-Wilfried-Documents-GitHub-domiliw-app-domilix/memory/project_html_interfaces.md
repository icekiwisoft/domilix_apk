---
name: HTML Interface References
description: Pixel-perfect HTML/CSS design mockups for every screen — the primary visual reference when implementing any screen
type: project
---

Each screen in the app has a reference implementation at `interfacesHTML/stitch_domilix_mobile_app_ui_kit/<screen>/code.html` (+ `screen.png` for visual preview).

**How to apply:** Before implementing any screen or component, read the corresponding `code.html`. Extract exact colors, spacing, text labels (French), icon names, layout structure, and component patterns from it rather than guessing.

**Why:** The HTML files use Tailwind utility classes directly mapped to the DESIGN.md token system. They encode every visual decision: shadow values, border widths, pill labels, gradient overlays, etc.

## Available screens

| Directory | Screen |
|-----------|--------|
| `accueil/` | Home feed with property cards and broadcast banner |
| `onboarding_1/` | Onboarding intro |
| `inscription/` | Register / login (split layout desktop, full-screen mobile) |
| `explorer/` | Search & browse with chips and bento grid |
| `filtres_d_exploration/` | Filter bottom sheet (standing, budget, rooms, amenities) |
| `d_tails_de_l_annonce_immobilier/` | Real-estate detail (hero carousel, specs, CTA) |
| `d_tails_de_l_annonce_mobilier/` | Furniture detail (sticky left image, scrolling right) |
| `mes_favoris/` | Liked announces grid |
| `notifications/` | Notification list with unread indicators |
| `mon_profil/` | User profile (settings, stats, menu) |
| `profil_annonceur/` | Announcer public profile with listings |
| `plans_d_abonnement/` | Subscription/pricing plans |
| `vue_carte/` | Map view with property pins |

## Key patterns extracted from HTML

**Icons:** Google Material Symbols (`font-variation-settings: 'FILL' 0` outline / `'FILL' 1` solid). Common icons: `home`, `search`, `favorite`, `notifications`, `person`, `bed`, `shower`, `square_foot`, `location_on`, `lock`, `lock_open`, `call`, `chat`, `tune`, `share`, `verified`, `workspace_premium`.

**Cards:** `rounded-xl` (12px) or `rounded-2xl` (16px), `border border-outline-variant`, `shadow-[0px_10px_20px_rgba(82,69,52,0.04)]`, image takes top 60% with `group-hover:scale-105 duration-500`.

**Status badges:** Pill shape (`rounded-full`), backgrounds at 10-15% opacity with full-strength text. "Nouveau" = `primary-fixed-dim` text; "Exclusivité" = tertiary; "Vendu/Loué" = error.

**Bottom navigation (mobile):** `fixed bottom-0 w-full`, 5 tabs: Accueil / Explorer / Favoris / Alertes / Profil. Active: `text-primary FILL:1 font-bold`.

**Shadows (exact values):**
- Card: `0px 10px 20px rgba(82,69,52,0.04)`
- Bottom bar: `0px -10px 30px rgba(82,69,52,0.05)`
- Elevated: `0px 15px 30px rgba(82,69,52,0.08)`

**Phone input:** `+237` prefix in `bg-surface-container` box, then free-type field.

**Safe area:** `pb-[env(safe-area-inset-bottom)]` on bottom nav, `pt-[env(safe-area-inset-top)]` on status bar areas.
