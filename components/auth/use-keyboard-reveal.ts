import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  type View,
} from 'react-native';

import { Spacing } from '@/constants/theme';

type Rect = { y: number; height: number };

function measure(node: { measureInWindow: View['measureInWindow'] } | null | undefined): Promise<Rect | null> {
  return new Promise((resolve) => {
    if (!node) return resolve(null);
    node.measureInWindow((_x, y, _w, height) => resolve({ y, height }));
  });
}

/**
 * When the keyboard opens on a form screen, scrolls so the main button sits
 * above the keyboard, without pushing the focused field off the top.
 * Android only scrolls the focused field into view on its own, which leaves
 * the main button under the keyboard (UI-01 / UI-02 criteria).
 *
 * `pastBanner` turns true once the content scrolls under the status bar, so
 * the screen can paint a band behind it (edge-to-edge).
 */
export function useKeyboardReveal(bannerBottom: number) {
  const scrollRef = useRef<ScrollView>(null);
  const targetRef = useRef<View>(null);
  const scrollY = useRef(0);
  const [pastBanner, setPastBanner] = useState(false);

  // Top of the open keyboard in window coordinates, null when it is closed.
  const keyboardTop = useRef<number | null>(null);

  async function reveal() {
    const scroll = scrollRef.current;
    if (!scroll || keyboardTop.current == null) return;
    const focused = TextInput.State.currentlyFocusedInput() as unknown as View | null;
    const [viewport, target, field] = await Promise.all([
      measure(scroll as unknown as View),
      measure(targetRef.current),
      measure(focused),
    ]);
    if (!viewport || !target || keyboardTop.current == null) return;
    const visibleBottom = Math.min(viewport.y + viewport.height, keyboardTop.current);
    let delta = target.y + target.height + Spacing.md - visibleBottom;
    if (field) delta = Math.min(delta, field.y - viewport.y - Spacing.md);
    if (delta > 0) scroll.scrollTo({ y: scrollY.current + delta, animated: true });
  }

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardTop.current = e.endCoordinates.screenY;
      // Let the layout settle after the keyboard opens before measuring.
      setTimeout(reveal, 80);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = null;
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /**
   * The KeyboardAvoidingView shrinks the scroll view after keyboardDidShow.
   * A scroll requested before that is capped by the old, taller viewport
   * (less content left to scroll), which left "Créer mon compte" half under
   * the keyboard (QA-07): measure again once the scroll view has its new size.
   */
  function onLayout() {
    if (keyboardTop.current != null) reveal();
  }

  /**
   * Moving focus from one field to another with the keyboard already open
   * fires neither keyboardDidShow nor a resize, so the button stayed under the
   * keyboard (sign-up, password field). Pass this as the fields' onFocus.
   */
  function revealOnFocus() {
    if (keyboardTop.current != null) setTimeout(reveal, 80);
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollY.current = e.nativeEvent.contentOffset.y;
    const past = scrollY.current >= bannerBottom;
    if (past !== pastBanner) setPastBanner(past);
  }

  return { scrollRef, targetRef, onScroll, onLayout, revealOnFocus, pastBanner };
}
