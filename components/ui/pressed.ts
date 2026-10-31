import { Opacity } from '@/constants/theme';

/**
 * Press feedback of every Pressable, on Android and iOS alike:
 * `style={({ pressed }) => [..., pressedStyle(pressed)]}`.
 *
 * Do not use `android_ripple` (QA-01, UI-06). On React Native 0.81 with the
 * new background drawables (Fabric default), `BackgroundStyleApplicator
 * .setFeedbackUnderlay` builds a new CompositeBackgroundDrawable holding the
 * ripple and throws it away instead of setting it on the view: the ripple is
 * never drawn. Building that LayerDrawable still re-points the view's
 * background drawables' callback to the discarded copy, so every later
 * backgroundColor or borderColor change (a theme switch, as the ripple colour
 * comes from the theme and changes with it) updates the drawable without
 * invalidating the view, which keeps painting the previous colours.
 */
export function pressedStyle(pressed: boolean) {
  return pressed ? { opacity: Opacity.pressed } : null;
}
