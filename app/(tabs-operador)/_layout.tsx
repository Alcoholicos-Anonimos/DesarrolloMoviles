import Ionicons from '@react-native-vector-icons/ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        sceneStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
     
      <Tabs.Screen
        name="bandeja"
        options={{
          title: 'Bandeja',
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
        name="ZonasCuadrillas"
        options={{
          title: 'Zonas',
          tabBarIcon: ({ color, focused }) => 
            ( 
            <Ionicons name={focused ? 'location' : 'location-outline'}  
            size={24} 
             color={color} /> ),
        }}
      />
    </Tabs>
  );
}
