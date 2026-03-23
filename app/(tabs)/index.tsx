import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PropertyCard from '../../components/PropertyCard';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CitySelector from '../../components/CitySelector';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState('Patna');
  const [showCitySelector, setShowCitySelector] = useState(false);
  
  // Query properties like the web app
  const properties = useQuery(api.properties.getProperties, {});

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 99acres Style Header */}
        <View className="flex-row justify-between items-center px-4 pt-3 pb-4 bg-white">
          <View className="flex-row items-center">
            <View className="flex-row items-center">
              <Image 
                source={require('../../assets/logo.png')} 
                style={{ width: 32, height: 32 }}
                className="mr-2 rounded-sm-custom"
                resizeMode="contain"
              />
              <Text className="text-dark-2 font-poppins-bold text-2xl">24Dismil</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowCitySelector(true)}
              className="bg-gray-100 rounded-full px-2 py-1 ml-3 flex-row items-center border border-gray-200"
            >
              <Text className="text-text font-poppins-medium text-xs">{selectedCity}</Text>
              <FontAwesome5 name="chevron-down" size={10} color={Colors.text} className="ml-1" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
            <FontAwesome5 name="bell" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* City Selector Modal */}
        <CitySelector 
          visible={showCitySelector}
          onClose={() => setShowCitySelector(false)}
          selectedCity={selectedCity}
          onSelect={(city) => {
            setSelectedCity(city);
            setShowCitySelector(false);
          }}
        />

        {/* Global Search Bar */}
        <View className="px-4 pb-4 bg-white shadow-standard z-10">
          <TouchableOpacity className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg-custom px-4 py-3 shadow-standard">
            <FontAwesome5 name="search" size={16} color={Colors.textMuted} />
            <Text className="flex-1 ml-3 text-text-muted font-poppins-medium text-[15px]">Search city, locality or project...</Text>
            <View className="w-[1px] h-5 bg-gray-300 mx-3" />
            <FontAwesome5 name="microphone" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Category Quick Links (Pills) */}
        <View className="bg-white pb-4 pt-4 shadow-standard z-0">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 pr-2">
            {[
              { label: "Buy", icon: "home", active: true },
              { label: "Rent", icon: "building", active: false },
              { label: "Commercial", icon: "store", active: false },
              { label: "Plots", icon: "map-marked", active: false },
              { label: "PG", icon: "bed", active: false }
            ].map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                className={`flex-row items-center px-4 py-2 mr-3 rounded-lg-custom border ${
                  cat.active ? 'bg-primary/10 border-primary' : 'bg-white border-gray-200'
                }`}
              >
                <FontAwesome5 name={cat.icon} size={14} color={cat.active ? Colors.primary : Colors.textMuted} />
                <Text className={`ml-2 font-poppins-semibold text-sm ${cat.active ? 'text-primary' : 'text-text-muted'}`}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promotional Banner Placeholder */}
        <View className="px-4 mt-6 mb-2">
          <View className="w-full h-32 bg-dark-2 rounded-lg-custom flex-row overflow-hidden items-center justify-between p-4 px-6 shadow-standard border border-gray-100 relative">
             <View className="z-10 w-2/3">
               <Text className="text-white font-poppins-bold text-lg leading-tight mb-1">Zero Brokerage</Text>
               <Text className="text-white/80 font-inter text-xs mb-3">Find 100% verified genuine owner properties</Text>
               <TouchableOpacity className="bg-white rounded-base px-3 py-1.5 self-start">
                 <Text className="text-dark-2 text-xs font-poppins-semibold">Explore Now</Text>
               </TouchableOpacity>
             </View>
             <FontAwesome5 name="building" size={80} color="rgba(255,255,255,0.05)" className="absolute right-0 -bottom-4" />
          </View>
        </View>

        {/* Featured Properties Section */}
        <View className="flex-row justify-between items-center px-4 mt-6 mb-4">
          <Text className="text-dark font-poppins-bold text-lg">Recommended For You</Text>
          <TouchableOpacity>
             <Text className="text-primary font-poppins-semibold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {properties === undefined ? (
          <ActivityIndicator size="large" color={Colors.primary} className="mt-10" />
        ) : (
          properties.map((prop) => (
            <PropertyCard key={prop._id} property={prop} />
          ))
        )}
        
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
