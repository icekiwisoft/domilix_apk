import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUnreadCount } from '@/hooks/queries/use-notifications';

function NotifTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;
  return (
    <View style={styles.iconWrapper}>
      <IconSymbol
        name={focused ? 'bell.fill' : 'bell'}
        size={26}
        color={color}
      />
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: Colors.light.error }]}>
          <Text style={styles.badgeText}>
            {count > 9 ? '9+' : String(count)}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.tint,
        tabBarInactiveTintColor: C.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.outlineVariant,
          borderTopWidth: 1,
          shadowColor: 'rgb(82,69,52)',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          ...Typography.labelSm,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={26} name={focused ? 'house.fill' : 'house.fill'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="magnifyingglass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={26} name={focused ? 'heart.fill' : 'heart'} color={color} />
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
            <IconSymbol size={26} name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
    lineHeight: 11,
  },
});
