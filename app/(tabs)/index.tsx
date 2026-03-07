import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PropertyCard from '../../components/PropertyCard';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  // Query properties like the web app
  const properties = useQuery(api.properties.getProperties, {});

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 99acres Style Header */}
        <View className="flex-row justify-between items-center px-4 pt-2 pb-4 bg-white">
          <View className="flex-row items-center">
            <Text className="text-primary font-poppins-bold text-2xl">24dismil</Text>
            <View className="bg-gray-100 rounded-full px-2 py-1 ml-3 flex-row items-center border border-gray-200">
              <Text className="text-text font-inter-medium text-xs">Patna</Text>
              <FontAwesome5 name="chevron-down" size={10} color={Colors.text} className="ml-1" />
            </View>
          </View>
          <TouchableOpacity className="relative p-2">
            <FontAwesome5 name="bell" size={20} color={Colors.text} />
            <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>

        {/* Global Search Bar */}
        <View className="px-4 pb-4 bg-white shadow-sm z-10">
          <TouchableOpacity className="flex-row items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-3 shadow-sm">
            <FontAwesome5 name="search" size={16} color={Colors.textMuted} />
            <Text className="flex-1 ml-3 text-text-muted font-inter-medium text-[15px]">Search city, locality or project...</Text>
            <View className="w-[1px] h-5 bg-gray-300 mx-3" />
            <FontAwesome5 name="microphone" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Category Quick Links (Pills) */}
        <View className="bg-white pb-4 shadow-sm z-0">
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
                className={`flex-row items-center px-4 py-2 mr-3 rounded-full border ${
                  cat.active ? 'bg-primary/10 border-primary' : 'bg-white border-gray-200'
                }`}
              >
                <FontAwesome5 name={cat.icon} size={14} color={cat.active ? Colors.primary : Colors.textMuted} />
                <Text className={`ml-2 font-inter-semibold text-sm ${cat.active ? 'text-primary' : 'text-text-muted'}`}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promotional Banner Placeholder */}
        <View className="px-4 mt-6 mb-2">
          <View className="w-full h-32 bg-dark-2 rounded-xl flex-row overflow-hidden items-center justify-between p-4 px-6 shadow-md border border-gray-100 relative">
             <View className="z-10 w-2/3">
               <Text className="text-white font-poppins-bold text-lg leading-tight mb-1">Zero Brokerage</Text>
               <Text className="text-white/80 font-inter text-xs mb-3">Find 100% verified genuine owner properties</Text>
               <TouchableOpacity className="bg-white rounded-md px-3 py-1.5 self-start">
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
             <Text className="text-primary font-inter-semibold text-sm">See All</Text>
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
    </SafeAreaView>
  );
}
