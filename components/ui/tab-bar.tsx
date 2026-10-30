import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Borders, Fonts, Radii, Shadows, Sizes, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import type { IconName } from './icon-button';
import { pressedStyle } from './pressed';

export interface TabBarItem {
  icon: IconName;
  /** Icon of the selected tab (filled variant); defaults to `icon`. */
  activeIcon?: IconName;
}

export interface TabBarProps extends BottomTabBarProps {
  /** Icon per route name. Routes listed neither here nor as `centerRoute` are not shown. */
  items: Record<string, TabBarItem>;
  /** Route whose slot holds the raised central button instead of a tab. */
  centerRoute?: string;
  /** The central button (Publier): its own action, not a tab switch. */
  centerAction?: { label: string; icon: IconName; onPress: () => void };
}

/**
 * Tab labels are capped at 1.15× (QA-05, lot 3): four labels and the central
 * button must fit on one row at 200 % font size; the icon, the active pill
 * and the bold label carry the large-text need, and TalkBack reads the full
 * label.
 */
const LABEL_MAX_SCALE = 1.15;

function haptic() {
  if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Custom `tabBar` for expo-router Tabs (Material 3 navigation bar): each tab
 * is a 48 dp+ button with its icon in a pill when active (pill colour, filled
 * icon and bold label, not colour alone), and an optional raised amber
 * button in the middle. Contrast: onPrimaryFixed on the pill 12:1; active
 * label `link` 6.1:1 (light) / 11:1 (dark); inactive onSurfaceVariant 8.9:1;
 * onCta on cta 8.5:1.
 */
export function TabBar({ state, descriptors, navigation, items, centerRoute, centerAction }: TabBarProps) {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingTop: Spacing.sm,
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
          paddingHorizontal: Spacing.xs,
          backgroundColor: C.surfaceContainerLowest,
          borderTopWidth: Borders.thin,
          borderTopColor: C.outlineVariant,
        },
        Shadows.md,
      ]}
    >
      {state.routes.map((route, index) => {
        if (route.name === centerRoute && centerAction) {
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={centerAction.label}
                onPressIn={haptic}
                onPress={centerAction.onPress}
                style={({ pressed }) => [
                  {
                    marginTop: -Spacing.lg,
                    width: Sizes.publishButton,
                    height: Sizes.publishButton,
                    borderRadius: Radii.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: C.cta,
                    borderWidth: Borders.ring,
                    // Ring in the bar's own colour (a fixed white ring glared in dark mode).
                    borderColor: C.surfaceContainerLowest,
                  },
                  Shadows.button,
                  pressedStyle(pressed),
                ]}
              >
                <MaterialIcons name={centerAction.icon} size={Sizes.iconLg + Spacing.xs} color={C.onCta} />
              </Pressable>
            </View>
          );
        }
        const item = items[route.name];
        if (!item) return null;
        const { options } = descriptors[route.key];
        const label = typeof options.title === 'string' ? options.title : route.name;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            accessibilityState={{ selected: focused }}
            testID={options.tabBarButtonTestID}
            onPressIn={haptic}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              {
                flex: 1,
                minHeight: Sizes.touchTarget,
                alignItems: 'center',
                gap: Spacing.xs,
                paddingBottom: Spacing.xs,
              },
              pressedStyle(pressed),
            ]}
          >
            <View
              style={{
                width: Sizes.tabPillWidth,
                height: Sizes.tabPillHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Mounted only when focused: changing the background of a mounted
                  rounded View drew a square pill after a tab switch (RN 0.81). */}
              {focused ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    borderRadius: Radii.full,
                    backgroundColor: C.primaryFixed,
                  }}
                />
              ) : null}
              <MaterialIcons
                name={focused ? (item.activeIcon ?? item.icon) : item.icon}
                size={Sizes.iconLg}
                color={focused ? C.onPrimaryFixed : C.onSurfaceVariant}
              />
            </View>
            <AppText
              variant="caption"
              color={focused ? 'link' : 'onSurfaceVariant'}
              numberOfLines={1}
              maxFontSizeMultiplier={LABEL_MAX_SCALE}
              style={focused ? { fontFamily: Fonts.bold } : null}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
