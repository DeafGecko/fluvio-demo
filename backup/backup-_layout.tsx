import { Tabs } from 'expo-router';
import { ChartPieIcon, HomeIcon, LightBulbIcon } from 'react-native-heroicons/outline';
import { LightBulbIcon as BulbSolid, ChartPieIcon as ChartSolid, HomeIcon as HomeSolid } from 'react-native-heroicons/solid';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#080c14',
          borderTopColor: '#0f172a',
          borderTopWidth: 1,
          paddingTop: 10,
          height: 80,
        },
        tabBarActiveTintColor: '#f8fafc',
        tabBarInactiveTintColor: '#334155',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({ focused }) =>
            focused
              ? <HomeSolid size={24} color="#f8fafc" />
              : <HomeIcon size={24} color="#334155" />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarLabel: 'STATS',
          tabBarIcon: ({ focused }) =>
            focused
              ? <ChartSolid size={24} color="#f8fafc" />
              : <ChartPieIcon size={24} color="#334155" />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarLabel: 'INSIGHTS',
          tabBarIcon: ({ focused }) =>
            focused
              ? <BulbSolid size={24} color="#f8fafc" />
              : <LightBulbIcon size={24} color="#334155" />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{ href: null }}
      />
    </Tabs>
  );
}