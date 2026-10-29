// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Design guard (UI-06): colours and style sizes come from constants/theme.ts.
const STYLE_SIZE_KEYS =
  '/^(fontSize|lineHeight|borderRadius|border(Top|Bottom)(Left|Right|Start|End)Radius|(padding|margin)(Top|Bottom|Left|Right|Horizontal|Vertical|Start|End)?|gap|rowGap|columnGap)$/';
const TOKEN_HINT = 'use a token from constants/theme.ts (Spacing, Radii, TextVariants)';
const designGuard = [
  {
    selector: 'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
    message: 'Hex colour literal: use a Colors token from constants/theme.ts.',
  },
  {
    selector: 'Literal[value=/^(rgb|hsl)a?\\(/i]',
    message: 'rgb()/hsl() colour literal: use a Colors token from constants/theme.ts.',
  },
  {
    // 0 stays allowed (resets such as padding: 0).
    selector: `Property[key.name=${STYLE_SIZE_KEYS}] > Literal[value>0]`,
    message: `Raw style number: ${TOKEN_HINT}.`,
  },
  {
    selector: `Property[key.name=${STYLE_SIZE_KEYS}] > UnaryExpression[operator='-'] > Literal`,
    message: `Raw negative style number: ${TOKEN_HINT}.`,
  },
  {
    // Spacing.xs + 2, insets.top + 10: an off-scale value in disguise.
    selector: `Property[key.name=${STYLE_SIZE_KEYS}] > BinaryExpression > Literal[value>0]`,
    message: `Raw number added to a style value: ${TOKEN_HINT}.`,
  },
];

// Primitives written before UI-06, still on raw values until step 4 rewrites
// or retires them. Every other file in components/ui must pass the guard.
const LEGACY_UI = [
  'components/ui/avatar.tsx',
  'components/ui/badge.tsx',
  'components/ui/bottom-sheet.tsx',
  'components/ui/collapsible.tsx',
  'components/ui/divider.tsx',
  'components/ui/icon-symbol.tsx',
  'components/ui/icon-symbol.ios.tsx',
  'components/ui/input.tsx',
  'components/ui/login-gate.tsx',
  'components/ui/otp-input.tsx',
  'components/ui/plan-card.tsx',
  // Rewritten or aligned by UI-06 step 2, then removed from this list.
  'components/ui/empty-state.tsx',
  'components/ui/toast.tsx',
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Warning only until the screens are migrated (UI-06 step 4).
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['constants/theme.ts', 'eslint.config.js'],
    rules: { 'no-restricted-syntax': ['warn', ...designGuard] },
  },
  {
    files: ['components/ui/**/*.{ts,tsx}'],
    ignores: LEGACY_UI,
    rules: { 'no-restricted-syntax': ['error', ...designGuard] },
  },
]);
