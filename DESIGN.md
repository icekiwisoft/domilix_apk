---
name: Warm Marketplace Narrative
colors:
  surface: '#fff8f4'
  surface-dim: '#e7d7ca'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e6'
  surface-container: '#fbebde'
  surface-container-high: '#f5e5d8'
  surface-container-highest: '#f0e0d3'
  on-surface: '#221a12'
  on-surface-variant: '#534435'
  inverse-surface: '#382f26'
  inverse-on-surface: '#feeee1'
  outline: '#867462'
  outline-variant: '#d9c3af'
  surface-tint: '#885200'
  primary: '#885200'
  on-primary: '#ffffff'
  primary-container: '#e8921a'
  on-primary-container: '#573300'
  inverse-primary: '#ffb869'
  secondary: '#516071'
  on-secondary: '#ffffff'
  secondary-container: '#d1e1f5'
  on-secondary-container: '#556475'
  tertiary: '#01658a'
  on-tertiary: '#ffffff'
  tertiary-container: '#66aed6'
  on-tertiary-container: '#004059'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcbb'
  primary-fixed-dim: '#ffb869'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#673d00'
  secondary-fixed: '#d4e4f8'
  secondary-fixed-dim: '#b8c8dc'
  on-secondary-fixed: '#0d1d2b'
  on-secondary-fixed-variant: '#394858'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#88cff9'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#fff8f4'
  on-background: '#221a12'
  surface-variant: '#f0e0d3'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 60px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 48px
---

## Brand & Style

This design system is built for a vibrant real estate and furniture marketplace, specifically tailored to the Cameroonian market. The brand personality is **warm, professional, and trustworthy**, bridging the gap between high-value property investments and personal home styling. 

The visual style follows a **Corporate Modern** approach with **Tactile** warmth. It leverages a "sun-drenched" palette to evoke a sense of home and comfort, while maintaining rigorous professional standards through precise typography and structured layouts. The emotional goal is to make users feel secure in their financial decisions while feeling inspired by the lifestyle possibilities of the marketplace.

## Colors

The color strategy centers on a vivid orange primary tone to drive action and energy, balanced by deep blue-greys and teals that ground the experience in reliability. 

- **Primary & Containers:** Used for high-priority CTAs (Buy, Book, Contact). The Amber container is reserved for highlighting premium listings or special offers.
- **Secondary & Tertiary:** Used for secondary actions and categorization (e.g., distinguishing between 'Rent' and 'Buy' or 'Furniture' and 'Real Estate').
- **Surface & Background:** A warm cream background replaces sterile whites to create a welcoming, "homely" atmosphere. 
- **Text:** Dark brown is used instead of pure black to maintain softness and readability against the cream background.

## Typography

This design system uses a dual-font strategy: **Plus Jakarta Sans** for headlines and navigation to provide a friendly, optimistic personality, and **Manrope** for body copy to ensure maximum legibility and a modern, professional feel.

- **Scale:** Large display sizes are intended for marketing splashes and hero property details. 
- **Hierarchy:** Use Headline Small for card titles. Body Large is preferred for property descriptions to enhance readability on mobile devices.
- **Weights:** Use 600/700 for headlines to ensure they stand out against the rich background colors. Manrope's 500 weight is the default for interactive elements like input labels.

## Layout & Spacing

The layout utilizes a **fluid grid** optimized for mobile-first consumption. 

- **Grid:** A 4-column layout for mobile devices with a 16px outer margin and 12px gutters.
- **Rhythm:** An 8px base unit drives all spatial relationships. 
- **Density:** High-density lists (like search results) should use `sm` (8px) spacing between items, while content-heavy detail pages should use `xl` (24px) to allow the "Warm Cream" surface to provide breathing room.

## Elevation & Depth

Visual hierarchy is established using **Tonal Layers** and **Ambient Shadows**.

- **Surfaces:** Use the secondary container color (light blue-grey) to define "sunken" areas like search bars or filter chips.
- **Shadows:** 
    - **Soft Elevation (Cards):** Use a very diffused shadow `(0 4px 20px rgba(0,0,0,0.04))` to lift property cards off the warm background without creating harsh edges.
    - **Structural Elevation (Navigation):** Use a tight shadow `(0 1px 4px rgba(0,0,0,0.06))` for bottom navigation bars and top app bars to signify they are fixed in the Z-space.
- **Borders:** Use the `border` token (#D7C3AE) for structural separation where shadows might cause too much visual noise, such as in form sections or list dividers.

## Shapes

The shape language is **Soft** but geometric, reflecting architectural precision. 

- **Default (4px):** Used for small UI elements like checkboxes, tags, and badges.
- **Cards (8px):** Property and furniture cards use a slightly larger radius to feel approachable and modern.
- **Interactive (12px):** Buttons and Text Inputs use the largest radius to create a distinct, tactile area for user interaction, making them easy to "hit" on mobile screens.

## Components

- **Buttons:** Primary buttons use `#E8921A` with white text and a 12px radius. Secondary buttons should use an outline style with the `Secondary` blue-grey.
- **Input Fields:** Use a 12px radius with the `border` token. On focus, the border shifts to `Primary` orange. Labels use Manrope 600 in `Main Text`.
- **Property Cards:** Must include the 8px radius and the Card Shadow. The price should be highlighted using `Headline Small` in `Primary` orange.
- **Chips/Filters:** Use `Secondary Container` background with `Secondary` text color for an unselected state; fill with `Primary` for the active state.
- **Navigation Bar:** A fixed bottom bar with a white background and the Navigation Shadow. Icons should use `Secondary` (inactive) and `Primary` (active).
- **Status Badges:** For "For Rent" or "For Sale," use small capsules with 4px radius, utilizing `Tertiary` and `Tertiary Container` to distinguish from CTAs.