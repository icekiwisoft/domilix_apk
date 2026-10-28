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

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', (e) => {
      const keyboardTop = e.endCoordinates.screenY;
      // Let the layout settle after the window resize before measuring.
      setTimeout(async () => {
        const scroll = scrollRef.current;
        if (!scroll) return;
        const focused = TextInput.State.currentlyFocusedInput() as unknown as View | null;
        const [viewport, target, field] = await Promise.all([
          measure(scroll as unknown as View),
          measure(targetRef.current),
          measure(focused),
        ]);
        if (!viewport || !target) return;
        const visibleBottom = Math.min(viewport.y + viewport.height, keyboardTop);
        let delta = target.y + target.height + Spacing.md - visibleBottom;
        if (field) delta = Math.min(delta, field.y - viewport.y - Spacing.md);
        if (delta > 0) scroll.scrollTo({ y: scrollY.current + delta, animated: true });
      }, 80);
    });
    return () => sub.remove();
  }, []);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollY.current = e.nativeEvent.contentOffset.y;
    const past = scrollY.current >= bannerBottom;
    if (past !== pastBanner) setPastBanner(past);
  }

  return { scrollRef, targetRef, onScroll, pastBanner };
}
