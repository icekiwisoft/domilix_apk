import { Tabs, router } from 'expo-router';
import { useEffect, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ICON_SPRING = { damping: 14, stiffness: 200 };
const INDICATOR_SPRING = { damping: 16, stiffness: 220 };
const LABEL_SPRING = { damping: 15, stiffness: 280 };

function useTabAnimation(focused: boolean) {
  const scale = useSharedValue(focused ? 1.15 : 1);
  const translateY = useSharedValue(focused ? -2 : 0);
  const indicatorWidth = useSharedValue(focused ? 16 : 0);
  const indicatorOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, ICON_SPRING);
    translateY.value = withSpring(focused ? -2 : 0, ICON_SPRING);
    indicatorWidth.value = withSpring(focused ? 16 : 0, INDICATOR_SPRING);
    indicatorOpacity.value = withTiming(focused ? 1 : 0, { duration: focused ? 120 : 80 });
  }, [focused, indicatorOpacity, indicatorWidth, scale, translateY]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const indicatorAnimStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    opacity: indicatorOpacity.value,
  }));

  return { iconAnimStyle, indicatorAnimStyle };
}

function TabIcon({
  name,
  color,
  focused,
  size = 24,
}: {
  name: ComponentProps<typeof IconSymbol>['name'];
  color: string;
  focused: boolean;
  size?: number;
}) {
  const { iconAnimStyle, indicatorAnimStyle } = useTabAnimation(focused);

  return (
    <View style={styles.iconPill}>
      <Animated.View style={iconAnimStyle}>
        <IconSymbol name={name} size={size} color={color} />
      </Animated.View>
      <Animated.View style={[styles.indicator, { backgroundColor: color }, indicatorAnimStyle]} />
    </View>
  );
}

function TabLabel({
  focused,
  color,
  children,
}: {
  focused: boolean;
  color: string;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(focused ? 1 : 0.92);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.92, LABEL_SPRING);
  }, [focused, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text
      style={[
        {
          fontFamily: focused ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
          fontSize: 12,
          textTransform: 'capitalize',
          letterSpacing: 0.6,
          color,
          marginTop: 3,
        },
        animStyle,
      ]}
    >
      {children}
    </Animated.Text>
  );
}

function PublishTabButton({ color }: { color: string }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Publier une annonce"
      hitSlop={8}
      onPress={() => router.push('/announces/create/step-1')}
      onPressIn={() => {
        scale.value = withSpring(0.94, ICON_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, ICON_SPRING);
      }}
      style={styles.publishSlot}
    >
      <Animated.View style={[styles.publishButton, { backgroundColor: color }, Shadows.button, animStyle]}>
        <IconSymbol name="plus" size={34} color="#ffffff" />
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const LIFT = 5;
  const tabBarHeight = 68 + Math.max(0, insets.bottom - LIFT);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: C.surfaceContainerLowest,
          borderTopColor: C.outlineVariant + '55',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Math.max(8, insets.bottom - LIFT),
          paddingTop: 8,
          ...Shadows.md,
        },
        tabBarLabel: ({ focused, color, children }) => (
          <TabLabel focused={focused} color={color}>{children}</TabLabel>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="magnifyingglass" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarButton: () => <PublishTabButton color={C.primary} />,
          tabBarItemStyle: styles.publishItem,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart.fill' : 'heart'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  publishItem: {
    justifyContent: 'center',
  },
  publishSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  publishButton: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#ffffff',
  },
});
