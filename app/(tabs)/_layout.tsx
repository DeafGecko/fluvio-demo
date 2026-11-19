import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ArrowsRightLeftIcon, ChartBarIcon, HomeIcon, WalletIcon } from 'react-native-heroicons/outline';
import { FluvioTabBar } from '../../components/fluvio-tab-bar';
import { useTheme } from '../../hooks/use-theme';

// The four primary tabs. Profile, Settings, Sign In, and other screens sit above the tabs in the root stack.
export default function TabsLayout() {
  const { c } = useTheme();
  const router = useRouter();
  // On web, a first visit to "/" opens these tabs directly, so check onboarding here too.
  // New users go to Welcome. The splash does the same check on native.
  useEffect(() => {
    AsyncStorage.getItem('onboarded').then((done) => { if (!done) router.replace('/welcome'); }).catch(() => {});
  }, [router]);
  return (
    <Tabs
      tabBar={(props) => <FluvioTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarActiveTintColor: c.accent, tabBarInactiveTintColor: c.textTertiary }}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <HomeIcon size={22} color={color} /> }} />
      <Tabs.Screen name="activity" options={{ tabBarLabel: 'Activity', tabBarIcon: ({ color }) => <ArrowsRightLeftIcon size={22} color={color} /> }} />
      <Tabs.Screen name="insights" options={{ tabBarLabel: 'Insights', tabBarIcon: ({ color }) => <ChartBarIcon size={22} color={color} /> }} />
      <Tabs.Screen name="accounts" options={{ tabBarLabel: 'Accounts', tabBarIcon: ({ color }) => <WalletIcon size={22} color={color} /> }} />
    </Tabs>
  );
}
