// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Design guard (UI-06): colours and style sizes come from constants/theme.ts.
const STYLE_SIZE_KEYS =
  '/^(fontSize|lineHeight|borderRadius|border(Top|Bottom)(Left|Right|Start|End)Radius|(padding|margin)(Top|Bottom|Left|Right|Horizontal|Vertical|Start|End)?|gap|rowGap|columnGap)$/';
const NAMED_COLOURS =
  '/^(white|black|red|green|blue|yellow|orange|purple|pink|brown|gray|grey|silver|gold|cyan|magenta)$/i';
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
    // Spacing.xs + 2, insets.top + 10: an off-scale value in disguise. Only + and -:
    // Spacing.sm * 2 or Sizes.stateIcon / 2 stay on the scale and are allowed.
    selector: `Property[key.name=${STYLE_SIZE_KEYS}] > BinaryExpression[operator=/^[+-]$/] > Literal[value>0]`,
    message: `Raw number added to a style value: ${TOKEN_HINT}.`,
  },
  {
    // padding: compact ? 6 : 12
    selector: `Property[key.name=${STYLE_SIZE_KEYS}] > ConditionalExpression > Literal[value>0]`,
    message: `Raw style number in a ternary: ${TOKEN_HINT}.`,
  },
  {
    // backgroundColor: 'white', <Icon color="black" />. 'transparent' stays allowed.
    selector: `:matches(Property[key.name=/[cC]olor$/], JSXAttribute[name.name=/[cC]olor$/]) Literal[value=${NAMED_COLOURS}]`,
    message: 'Named colour literal: use a Colors token from constants/theme.ts.',
  },
];

// Primitives written before UI-06, still on raw values until step 4 rewrites
// or retires them. Every other file in components/ui must pass the guard.
const LEGACY_UI = [
  'components/ui/bottom-sheet.tsx',
  'components/ui/collapsible.tsx',
  'components/ui/icon-symbol.tsx',
  'components/ui/icon-symbol.ios.tsx',
  'components/ui/input.tsx',
  'components/ui/login-gate.tsx',
  'components/ui/otp-input.tsx',
  'components/ui/plan-card.tsx',
  // Still used by my-listings with a Paper button; replaced by EmptyState from
  // states.tsx when that screen is migrated (step 4).
  'components/ui/empty-state.tsx',
];

module.exports = defineConfig([
  expoConfig,
  {
    // .agents and .kiro hold third-party agent skills (scripts with their own deps).
    ignores: ['dist/*', '.agents/**', '.kiro/**'],
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
