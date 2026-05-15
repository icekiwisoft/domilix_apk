---
name: Domilix Editorial System
colors:
  surface: '#fff8f4'
  surface-dim: '#e3d8ce'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf2e7'
  surface-container: '#f7ece2'
  surface-container-high: '#f2e6dc'
  surface-container-highest: '#ece1d7'
  on-surface: '#201b15'
  on-surface-variant: '#504537'
  inverse-surface: '#352f29'
  inverse-on-surface: '#faefe5'
  outline: '#827565'
  outline-variant: '#d4c4b2'
  surface-tint: '#835500'
  primary: '#633f00'
  on-primary: '#ffffff'
  primary-container: '#835500'
  on-primary-container: '#ffd197'
  inverse-primary: '#f9bb65'
  secondary: '#516071'
  on-secondary: '#ffffff'
  secondary-container: '#d1e1f5'
  on-secondary-container: '#556475'
  tertiary: '#004d6a'
  on-tertiary: '#ffffff'
  tertiary-container: '#03668b'
  on-tertiary-container: '#afe0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#f9bb65'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#d4e4f8'
  secondary-fixed-dim: '#b8c8dc'
  on-secondary-fixed: '#0d1d2b'
  on-secondary-fixed-variant: '#394858'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#88cff9'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#fff8f4'
  on-background: '#201b15'
  surface-variant: '#ece1d7'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 60px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 80px
---

## Brand & Style

This design system is anchored in **Editorial Minimalism**, blending the sophistication of high-end architectural journals with the functional clarity of a modern marketplace. It targets a discerning Cameroonian clientele in Douala and Yaoundé, evoking a sense of curated luxury, stability, and local pride.

The aesthetic is "Confident Premium." It avoids clutter, favoring expansive whitespace that allows high-resolution photography of properties and bespoke furniture to breathe. The visual narrative is quiet but authoritative, using a sophisticated warm palette to distance the product from the coldness of typical tech platforms, creating an atmosphere of comfort and exclusivity.

## Colors

The palette is rooted in earth tones and warmth, reflecting both the premium positioning and the natural textures of high-end real estate.

- **Primary (Deep Amber):** Used for brand presence and key structural elements. It conveys maturity and value.
- **Primary Container (Bright Orange):** Reserved strictly for high-priority Call to Actions (CTAs) and urgent status indicators. Use sparingly to maintain the editorial "calm."
- **Surface & Container:** The interaction between Warm White and Cream creates a subtle tonal hierarchy without relying on harsh lines.
- **Secondary & Tertiary:** Cool-toned slates and blues are used for utility features, secondary information, or specific furniture categories to provide visual relief from the warm base.

## Typography

The design system utilizes **Plus Jakarta Sans** across all levels to maintain a contemporary, clean look. 

Editorial impact is achieved through the **Display** and **Headline** scales, which should be set with tight line height and slight negative letter spacing to feel "locked" and confident. **Body** text is optimized for readability with a generous 1.6 line height, ensuring descriptions of properties remain inviting. **Labels** are utilized for metadata (e.g., "DISPONIBLE", "VENDU") and must always be tracked out for a premium, architectural feel.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for desktop to preserve the editorial composition, transitioning to a flexible fluid system for mobile.

- **Desktop:** A 12-column grid with a maximum width of 1280px. Margins are intentionally wide (64px) to enforce the "Generous Whitespace" narrative.
- **Mobile:** A 4-column grid with 20px side margins. 
- **Vertical Rhythm:** A base 8px unit is used. Sections should be separated by significant gaps (80px+) to ensure the UI never feels crowded, prioritizing the "premium" feel over information density.

## Elevation & Depth

Depth in this design system is communicated through **Tonal Layering** and **Ambient Shadows**.

- **Surface Tiers:** Use the `Surface Container` (Cream) to group content against the `Surface` (Warm White). This creates a "paper-on-table" effect.
- **Shadows:** Avoid heavy, dark shadows. Use a single "Soft Ambient" elevation for floating cards: `0px 10px 20px rgba(82, 69, 52, 0.04)`. This subtle tinting of the shadow with the Muted Text color ensures it feels integrated into the warm environment rather than a sterile grey.
- **Interactive States:** On hover, a card should not necessarily lift higher; instead, the 1px border may slightly darken to `Outline` strength.

## Shapes

The shape language is approachable yet structured. 

- **Buttons & Inputs:** 12px radius. This provides a soft, modern touch without becoming overly "bubbly" or playful, maintaining a professional air.
- **Cards:** 16px radius. The larger radius on cards helps them feel like distinct, premium objects on the canvas.
- **Avatars:** Strictly circular to contrast against the predominantly rectangular grid.
- **Selection Indicators:** Use pill-shapes (fully rounded) for tags or chips to differentiate them from functional buttons.

## Components

### Buttons
- **Primary:** Deep Amber background, white text. 12px radius.
- **CTA:** Bright Orange background. Used only for "Contacter l'agent" or "Réserver."
- **Ghost:** 1px `Outline Variant` border with `Text` color.

### Input Fields
- **Default State:** 1px border using `Outline Variant`. 12px radius. Background is `Surface`.
- **Focus State:** 2px border using `Primary` (Deep Amber). Label shifts to a floating position using `Label-sm` styles.

### Cards
- **Property/Furniture Card:** 16px radius, Soft Ambient shadow. Image should occupy the top 60% of the card. Content area uses `Surface Container` if placed on `Surface`.

### Chips & Status
- Use `Label-sm` typography. Status indicators (e.g., "Nouveau", "Exclusivité") use a subtle background of `Secondary` or `Tertiary` at 10% opacity with full-strength text.

### Navigation
- Top navigation should be airy. Use uppercase `Label-sm` for menu items to maintain the editorial feel. The language used throughout must be formal French (e.g., "Découvrir la collection" instead of "Voir plus").