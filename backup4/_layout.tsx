import { Tabs } from 'expo-router';
import { View } from 'react-native';
import {
      ChartPieIcon, HomeIcon,
      LightBulbIcon, UserCircleIcon,
} from 'react-native-heroicons/outline';
import {
      LightBulbIcon as BulbSolid,
      ChartPieIcon as ChartSolid,
      HomeIcon as HomeSolid,
      UserCircleIcon as UserSolid,
} from 'react-native-heroicons/solid';

const ACTIVE = '#4f9eff';
const INACTIVE = '#253550';

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
                        tabBarActiveTintColor: ACTIVE,
                        tabBarInactiveTintColor: INACTIVE,
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
                                    ? <GlowIcon><HomeSolid size={22} color={ACTIVE} /></GlowIcon>
                                    : <HomeIcon size={22} color={INACTIVE} />,
                        }}
                  />
                  <Tabs.Screen
                        name="stats"
                        options={{
                              tabBarLabel: 'STATS',
                              tabBarIcon: ({ focused }) => focused
                                    ? <GlowIcon><ChartSolid size={22} color={ACTIVE} /></GlowIcon>
                                    : <ChartPieIcon size={22} color={INACTIVE} />,
                        }}
                  />
                  <Tabs.Screen
                        name="insights"
                        options={{
                              tabBarLabel: 'INSIGHTS',
                              tabBarIcon: ({ focused }) => focused
                                    ? <GlowIcon><BulbSolid size={22} color={ACTIVE} /></GlowIcon>
                                    : <LightBulbIcon size={22} color={INACTIVE} />,
                        }}
                  />
                  <Tabs.Screen
                        name="profile"
                        options={{
                              tabBarLabel: 'PROFILE',
                              tabBarIcon: ({ focused }) => focused
                                    ? <GlowIcon><UserSolid size={22} color={ACTIVE} /></GlowIcon>
                                    : <UserCircleIcon size={22} color={INACTIVE} />,
                        }}
                  />
                  <Tabs.Screen name="add" options={{ href: null }} />
                  <Tabs.Screen name="onboarding" options={{ href: null }} />
            </Tabs>
      );
}

function GlowIcon({ children }: { children: React.ReactNode }) {
      return (
            <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: ACTIVE,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 6,
                  elevation: 0,
            }}>
                  {children}
            </View>
      );
}
