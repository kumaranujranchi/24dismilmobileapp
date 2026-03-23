import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e84118',
        tabBarInactiveTintColor: '#6b7280',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 12,
          height: 65 + Math.max(insets.bottom, 16),
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 11,
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
            title: 'Post',
            tabBarIcon: ({ color }) => (
               <View className="bg-primary p-3 rounded-2xl shadow-lg border-2 border-white -mt-8">
                 <FontAwesome5 name="plus" size={20} color="#ffffff" />
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
