import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import AuthForm from '../../components/AuthForm';
import GoogleLoginButton from '../../components/GoogleLoginButton';

export default function ProfileScreen() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // ============== UNAUTHENTICATED VIEW (LOGIN/REGISTER) ==============
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}>
          
          <View className="items-center mb-10">
            <View className="mb-6 shadow-sm">
              <Image 
                source={require('../../assets/logo.png')} 
                style={{ width: 80, height: 80, borderRadius: 16 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-dark-2 font-poppins-bold text-2xl text-center">24Dismil</Text>
            <Text className="text-text-muted font-poppins text-sm text-center mt-2 max-w-[280px]">
              Login to save properties, post listings, and contact owners directly.
            </Text>
          </View>

          <AuthForm />

          <View className="flex-row items-center my-6 max-w-md mx-auto w-full">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text className="mx-4 text-text-muted font-poppins text-xs">OR</Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </View>

          <View className="max-w-md mx-auto w-full mb-10">
            <GoogleLoginButton />
          </View>
          
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============== AUTHENTICATED VIEW (DASHBOARD) ==============
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-50">
        
        {/* User Card Header */}
        <View className="bg-primary pt-6 pb-20 px-6 rounded-b-[40px] shadow-sm relative">
           <View className="flex-row items-center">
             <View className="w-16 h-16 rounded-full border-2 border-white bg-white/20 items-center justify-center overflow-hidden">
               {user.profilePictureUrl ? (
                 <Image source={{ uri: user.profilePictureUrl }} className="w-full h-full" />
               ) : (
                 <Text className="text-white font-poppins-bold text-2xl">{user?.name?.[0]?.toUpperCase() || '?'}</Text>
               )}
             </View>
             <View className="ml-4 flex-1">
               <Text className="text-white font-poppins-semibold text-xl">{user.name}</Text>
               <Text className="text-white/80 font-inter text-sm">{user.email}</Text>
               
               <View className="flex-row items-center mt-1">
                 <View className="bg-white/20 px-2 py-0.5 rounded-sm mr-2">
                    <Text className="text-white font-poppins-semibold text-[10px] uppercase">
                      {user.subscriptionTier?.replace('_', ' ') || 'Free User'}
                    </Text>
                 </View>
               </View>
             </View>
           </View>
        </View>

        {/* Floating Quick Stats */}
        <View className="px-5 -mt-12 mb-6 z-10">
           <View className="bg-white rounded-xl shadow-card p-4 flex-row border border-gray-100">
              <View className="flex-1 items-center border-r border-gray-100">
                <Text className="text-dark font-poppins-bold text-lg">{user.propertyCount || 0}</Text>
                <Text className="text-text-muted font-poppins-medium text-xs">My Properties</Text>
              </View>
              <View className="flex-1 items-center border-r border-gray-100">
                <Text className="text-dark font-poppins-bold text-lg">{user.limit || 1}</Text>
                <Text className="text-text-muted font-poppins-medium text-xs">Post Limit</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-success font-poppins-bold text-lg">{user.canPostMore ? 'Yes' : 'No'}</Text>
                <Text className="text-text-muted font-poppins-medium text-xs">Can Post</Text>
              </View>
           </View>
        </View>

        <View className="px-5 mb-8">
          <Text className="text-text-muted font-poppins-semibold text-xs tracking-wider uppercase mb-3 ml-1">Account Options</Text>
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {[
              { label: 'Edit Profile', icon: 'user-edit', color: '#3b82f6' },
              { label: 'My Properties', icon: 'building', color: '#e84118' },
              { label: 'Shortlisted Properties', icon: 'heart', color: '#ec4899' },
              { label: 'Subscription Plan', icon: 'crown', color: '#f59e0b' },
              { label: 'Settings', icon: 'cog', color: '#6b7280' },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} className="flex-row items-center justify-between p-4 border-b border-gray-50">
                 <View className="flex-row items-center">
                   <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-3">
                     <FontAwesome5 name={item.icon} size={14} color={item.color} />
                   </View>
                   <Text className="text-dark font-inter-medium text-[15px]">{item.label}</Text>
                 </View>
                 <FontAwesome5 name="chevron-right" size={12} color="#9ca3af" />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity onPress={logout} className="flex-row items-center p-4">
              <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center mr-3">
                 <FontAwesome5 name="sign-out-alt" size={14} color="#ef4444" />
              </View>
              <Text className="text-red-500 font-poppins-semibold text-[15px]">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}
