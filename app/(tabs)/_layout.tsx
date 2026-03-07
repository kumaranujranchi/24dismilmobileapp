import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e84118',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'InterMedium',
          fontSize: 12,
        },
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color }) => <FontAwesome5 name="heart" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            title: 'Post Property',
            tabBarIcon: ({ color }) => (
               <View className="bg-primary-light/10 p-2 rounded-full border border-primary/20">
                 <FontAwesome5 name="plus-circle" size={22} color="#e84118" />
               </View>
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <FontAwesome5 name="search" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={20} color={color} />,
          }}
        />
      </Tabs>
  );
}
