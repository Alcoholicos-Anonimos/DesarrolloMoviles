import { Tabs } from 'expo-router';
import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
     
      <Tabs.Screen
        name="reclamo"
        options={{
          title: 'Mis Reclamos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

       <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => ( <Ionicons name={focused ? 'location' : 'location-outline'}  size={24}  color={color} /> ),
        }}
      />
    </Tabs>
  );
}
