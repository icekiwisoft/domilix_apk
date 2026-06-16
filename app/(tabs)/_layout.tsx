import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUnreadCount } from '@/hooks/queries/use-notifications';

function TabIcon({
  name,
  color,
  focused,
  size = 24,
}: {
  name: React.ComponentProps<typeof IconSymbol>['name'];
  color: string;
  focused: boolean;
  size?: number;
}) {
  return (
    <View style={styles.iconPill}>
      <IconSymbol name={name} size={size} color={color} />
      <View style={[styles.indicator, { backgroundColor: focused ? color : 'transparent' }]} />
    </View>
  );
}

function NotifTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;
  return (
    <View style={styles.iconPill}>
      <View style={styles.iconWrapper}>
        <IconSymbol name={focused ? 'bell.fill' : 'bell'} size={24} color={color} />
        {count > 0 && (
          <View style={[styles.badge, { backgroundColor: Colors.light.error }]}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : String(count)}</Text>
          </View>
        )}
      </View>
      <View style={[styles.indicator, { backgroundColor: focused ? color : 'transparent' }]} />
    </View>
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
          <Text style={{
            fontFamily: focused ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
            fontSize: 12,
            textTransform: 'capitalize',
            letterSpacing: 0.6,
            color,
            marginTop: 3,
          }}>
            {children}
          </Text>
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
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart.fill' : 'heart'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ color, focused }) => (
            <NotifTabIcon color={color} focused={focused} />
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
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -6,
    minWidth: 15,
    height: 15,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
    lineHeight: 10,
  },
});
