import { Tabs } from 'expo-router';
import { View } from 'react-native';
import {
      ChartPieIcon,
      HomeIcon,
      LightBulbIcon, UserCircleIcon,
} from 'react-native-heroicons/outline';
import {
      LightBulbIcon as BulbSolid,
      ChartPieIcon as ChartSolid,
      HomeIcon as HomeSolid,
      UserCircleIcon as UserSolid,
} from 'react-native-heroicons/solid';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#02040e',
          borderTopColor: '#0f1f35',
          borderTopWidth: 1,
          height: 88,
          paddingTop: 12,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: '#4f9eff',
        tabBarInactiveTintColor: '#253550',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.8,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({ focused }) => focused
            ? <GlowIcon icon={<HomeSolid size={22} color="#4f9eff" />} color="#4f9eff" />
            : <HomeIcon size={22} color="#253550" />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarLabel: 'STATS',
          tabBarIcon: ({ focused }) => focused
            ? <GlowIcon icon={<ChartSolid size={22} color="#4f9eff" />} color="#2dd4bf" />
            : <ChartPieIcon size={22} color="#253550" />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarLabel: 'INSIGHTS',
          tabBarIcon: ({ focused }) => focused
            ? <GlowIcon icon={<BulbSolid size={22} color="#4f9eff" />} color="#a855f7" />
            : <LightBulbIcon size={22} color="#253550" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'PROFILE',
          tabBarIcon: ({ focused }) => focused
            ? <GlowIcon icon={<UserSolid size={22} color="#4f9eff" />} color="#f59e0b" />
            : <UserCircleIcon size={22} color="#253550" />,
        }}
      />
      <Tabs.Screen name="add" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
    </Tabs>
  );
}

function GlowIcon({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <View style={{
      alignItems: 'center', justifyContent: 'center',
      shadowColor: color, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9, shadowRadius: 8,
    }}>
      {icon}
    </View>
  );
}