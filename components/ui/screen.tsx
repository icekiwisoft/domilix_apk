import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, type ReactNode, type RefObject } from 'react';
import {
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardReveal } from '@/components/auth/use-keyboard-reveal';
import { Spacing, type ColorToken } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/hooks/use-theme-color';

type ScreenKeyboard = {
  /** Attach to the View that must stay above the keyboard (the main button). */
  targetRef: RefObject<View | null>;
  /** Fields call it on focus: moving between fields fires no keyboard event. */
  revealOnFocus: () => void;
};

const ScreenKeyboardContext = createContext<ScreenKeyboard | null>(null);

/** Keyboard helpers of the enclosing `<Screen keyboard>`, or null. Field uses it. */
export function useScreenKeyboard() {
  return useContext(ScreenKeyboardContext);
}

/** Wrap the main button of a form screen so the keyboard never covers it. */
export function KeyboardTarget({ children }: { children: ReactNode }) {
  const keyboard = useScreenKeyboard();
  return (
    <View ref={keyboard?.targetRef} collapsable={false}>
      {children}
    </View>
  );
}

export interface ScreenProps extends Omit<ScrollViewProps, 'children' | 'style' | 'contentContainerStyle'> {
  children: ReactNode;
  /** Fixed above the content, under the status bar (ScreenHeader). */
  header?: ReactNode;
  /** Fixed under the content, above the gesture bar (action bar). */
  footer?: ReactNode;
  /** false: plain View filling the screen (lists, maps) instead of a ScrollView. */
  scroll?: boolean;
  /**
   * Form screen: the content moves above the keyboard and the KeyboardTarget
   * (main button) is scrolled into view when the keyboard opens (lot 2).
   */
  keyboard?: boolean;
  /**
   * Content starting with a full-bleed image under the status bar: the status
   * bar band appears only once this many dp have scrolled by.
   */
  heroHeight?: number;
  /** Status bar icons over the hero image, before the band appears. */
  heroStatusBar?: 'light' | 'dark';
  background?: ColorToken;
  onRefresh?: () => void;
  refreshing?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Screen frame: background, safe areas, edge-to-edge status bar band (the
 * content no longer shows through the status bar while scrolling), optional
 * scroll with pull-to-refresh, and keyboard handling for forms.
 */
export function Screen({
  children,
  header,
  footer,
  scroll = true,
  keyboard = false,
  heroHeight,
  heroStatusBar = 'light',
  background = 'background',
  onRefresh,
  refreshing = false,
  contentStyle,
  onScroll,
  onLayout,
  ...rest
}: ScreenProps) {
  const C = useThemeColors();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const bg = C[background];
  const hero = heroHeight != null && !header;
  const { scrollRef, targetRef, onScroll: trackScroll, onLayout: revealOnLayout, revealOnFocus, pastBanner } =
    useKeyboardReveal(hero ? heroHeight : 0);
  // Without a hero, the band is always there (the content starts under it).
  const showBand = !header && (!hero || pastBanner);
  const statusBarStyle = showBand || header ? (scheme === 'dark' ? 'light' : 'dark') : heroStatusBar;

  // A hero screen lays out its own horizontal padding under the full-bleed image.
  const padded: ViewStyle = {
    paddingHorizontal: hero ? 0 : Spacing.marginMobile,
    paddingTop: header ? Spacing.md : hero ? 0 : insets.top + Spacing.md,
    paddingBottom: footer ? Spacing.md : insets.bottom + Spacing.md,
    gap: Spacing.md,
  };

  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
      onScroll={(e) => {
        trackScroll(e);
        onScroll?.(e);
      }}
      onLayout={(e) => {
        revealOnLayout();
        onLayout?.(e);
      }}
      contentContainerStyle={[padded, { flexGrow: 1 }, contentStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.primaryContainer]}
            progressBackgroundColor={C.surfaceContainerLowest}
            tintColor={C.primaryContainer}
          />
        ) : undefined
      }
      {...rest}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[padded, { flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <ScreenKeyboardContext.Provider value={keyboard ? { targetRef, revealOnFocus } : null}>
      <KeyboardAvoidingView
        enabled={keyboard}
        // 'padding' on Android too: with edge-to-edge the window is not resized (lot 2).
        behavior="padding"
        style={{ flex: 1, backgroundColor: bg }}
      >
        {header ? <View style={{ paddingTop: insets.top, backgroundColor: bg }}>{header}</View> : null}
        {body}
        {footer ? <View style={{ paddingBottom: insets.bottom, backgroundColor: bg }}>{footer}</View> : null}
        {showBand ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: bg }}
          />
        ) : null}
        <StatusBar style={statusBarStyle} />
      </KeyboardAvoidingView>
    </ScreenKeyboardContext.Provider>
  );
}
