import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUnreadCount } from '@/hooks/queries/use-notifications';

function NotifTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;
  return (
    <View style={styles.iconWrapper}>
      <IconSymbol name={focused ? 'bell.fill' : 'bell'} size={24.5} color={color} />
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: Colors.light.error }]}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : String(count)}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // On remonte la tab bar de 15px au-dessus de l'encoche native
  const LIFT = 5;
  const tabBarHeight = 64 + Math.max(0, insets.bottom - LIFT);

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
            <View style={[styles.iconPill]}>
              <IconSymbol size={22.5} name={focused ? 'house.fill' : 'house.fill'} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconPill}>
              <IconSymbol size={22.5} name="magnifyingglass" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill]}>
              <IconSymbol size={22.5} name={focused ? 'heart.fill' : 'heart'} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill]}>
              <NotifTabIcon color={color} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill]}>
              <IconSymbol size={22.5} name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    width: 48,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
