import { Tabs, useRouter } from 'expo-router';

import { TabBar, type TabBarItem } from '@/components/ui';

const ITEMS: Record<string, TabBarItem> = {
  index: { icon: 'home' },
  explore: { icon: 'search' },
  favorites: { icon: 'favorite-border', activeIcon: 'favorite' },
  profile: { icon: 'person-outline', activeIcon: 'person' },
};

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <TabBar
          {...props}
          items={ITEMS}
          // The notifications route keeps its slot (reached from the home bell);
          // the bar shows the Publier button there instead of a tab.
          centerRoute="notifications"
          centerAction={{
            label: 'Publier une annonce',
            icon: 'add',
            onPress: () => router.push('/announces/create/step-1'),
          }}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorer' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoris' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
