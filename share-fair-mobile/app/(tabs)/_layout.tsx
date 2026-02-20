import { Tabs } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../../src/store';

export default function TabsLayout() {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';

  const bg = dark ? '#1a1a2e' : '#ffffff';
  const border = dark ? '#2d2d3e' : '#e5e7eb';
  const active = '#10B981';
  const inactive = dark ? '#6b7280' : '#9ca3af';

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        headerStyle: { backgroundColor: bg },
        headerTintColor: dark ? '#f0f0f0' : '#1a1a2e',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🏠" color={color} />
          ),
          headerTitle: 'Share Fair',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} />,
          headerTitle: 'Search',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <TabIcon emoji="➕" color={color} />,
          headerTitle: 'Create Listing',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} />,
          headerTitle: 'My Transactions',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}
