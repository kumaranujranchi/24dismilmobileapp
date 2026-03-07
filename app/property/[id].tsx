import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const property = useQuery(api.properties.getProperty, { id: id as Id<"properties"> });

  if (property === undefined) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (property === null) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-dark font-poppins-bold text-xl">Property not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-2 rounded-md">
          <Text className="text-white font-inter-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-50">
        
        {/* Image Header & Top Navigation */}
        <View className="relative w-full bg-gray-200" style={{ height: 280 }}>
           <Image 
             source={{ uri: property.photos?.[0] || 'https://via.placeholder.com/800x600' }} 
             className="w-full h-full"
             resizeMode="cover"
           />
           
           {/* Top Nav Overlay */}
           <View className="absolute top-4 w-full flex-row justify-between px-4 z-10">
             <TouchableOpacity 
               onPress={() => router.back()}
               className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full items-center justify-center shadow-sm"
             >
               <FontAwesome5 name="arrow-left" size={18} color="#2d2d2d" />
             </TouchableOpacity>

             <View className="flex-row">
               <TouchableOpacity className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full items-center justify-center shadow-sm mr-2">
                 <FontAwesome5 name="share-alt" size={16} color="#2d2d2d" />
               </TouchableOpacity>
               <TouchableOpacity className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full items-center justify-center shadow-sm">
                 <FontAwesome5 name="heart" size={18} color="#6b7280" />
               </TouchableOpacity>
             </View>
           </View>

           {/* Photo Indicator */}
           <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-full flex-row items-center">
             <FontAwesome5 name="images" size={12} color="white" />
             <Text className="text-white text-xs font-inter-semibold ml-2">1 / {property.photos?.length || 1}</Text>
           </View>
        </View>

        {/* Primary Details Section */}
        <View className="bg-white px-4 py-5 mb-2 shadow-sm border-b border-gray-100">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-dark font-poppins-bold text-3xl">
              ₹{property.pricing?.expectedPrice || '0'}
              <Text className="text-text-muted text-sm font-poppins-regular ml-1"> {property.pricing?.priceType || ''}</Text>
            </Text>
          </View>
          
          <Text className="text-dark font-inter-semibold text-input leading-relaxed mb-3">
            {property.details?.bhk || ''} {property.propertyType || 'Property'} For Sale in {property.location?.society || property.location?.locality || property.location?.city || 'Location'}
          </Text>

          <View className="flex-row items-center mb-4">
            <FontAwesome5 name="map-marker-alt" size={14} color="#6b7280" />
            <Text className="text-text-muted font-inter text-sm ml-2.5">
              {property.location?.locality || ''}, {property.location?.city || ''}
            </Text>
          </View>

          {/* Key High-Level Specs Grid */}
          <View className="flex-row flex-wrap border border-gray-200 rounded-xl overflow-hidden mt-2">
            <View className="w-1/3 border-r border-b border-gray-200 p-3 items-center bg-gray-50/50">
              <Text className="text-text-muted text-[11px] font-inter-medium uppercase">Built-up Area</Text>
              <Text className="text-dark font-poppins-semibold text-sm mt-0.5">{property.details?.builtUpArea || 0} sqft</Text>
            </View>
            <View className="w-1/3 border-r border-b border-gray-200 p-3 items-center bg-gray-50/50">
              <Text className="text-text-muted text-[11px] font-inter-medium uppercase">Carpet Area</Text>
              <Text className="text-dark font-poppins-semibold text-sm mt-0.5">{property.details?.carpetArea || 0} sqft</Text>
            </View>
            <View className="w-1/3 border-b border-gray-200 p-3 items-center bg-gray-50/50">
              <Text className="text-text-muted text-[11px] font-inter-medium uppercase">Status</Text>
              <Text className="text-dark font-poppins-semibold text-sm mt-0.5">{property.details?.status || 'Ready'}</Text>
            </View>
            <View className="w-1/3 border-r border-gray-200 p-3 items-center bg-gray-50/50">
              <Text className="text-text-muted text-[11px] font-inter-medium uppercase">Floor</Text>
              <Text className="text-dark font-poppins-semibold text-sm mt-0.5">
                {property.details?.floorNo || 0}/{property.details?.totalFloors || 0}
              </Text>
            </View>
            <View className="w-1/3 border-r border-gray-200 p-3 items-center bg-gray-50/50">
              <Text className="text-text-muted text-[11px] font-inter-medium uppercase">Furnishing</Text>
              <Text className="text-dark font-poppins-semibold text-sm mt-0.5 capitalize">{property.details?.furnishing || 'Unfurnished'}</Text>
            </View>
            <View className="w-1/3 border-gray-200 p-3 items-center bg-gray-50/50">
              <Text className="text-text-muted text-[11px] font-inter-medium uppercase">Age</Text>
              <Text className="text-dark font-poppins-semibold text-sm mt-0.5">{property.details?.age || 'New'}</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View className="bg-white px-4 py-5 mb-2 shadow-sm border-b border-gray-100">
           <Text className="text-dark font-poppins-bold text-lg mb-3">More Details</Text>
           <Text className="text-text leading-6 font-inter text-[15px]">
             {property.description || "A remarkably well-maintained premium property available for sale. Features excellent amenities and connectivity. Contact the owner for a site visit and more details."}
           </Text>
           <TouchableOpacity className="mt-3">
             <Text className="text-primary font-inter-semibold">Read More</Text>
           </TouchableOpacity>
        </View>

        {/* Similar Properties Hook */}
        <View className="bg-primary/5 mx-4 mt-6 mb-8 rounded-xl p-5 items-center border border-primary/20">
           <FontAwesome5 name="bell" size={24} color="#e84118" className="mb-2" />
           <Text className="text-dark font-poppins-bold text-base text-center">Get personalized alerts</Text>
           <Text className="text-text-muted font-inter text-center text-sm mt-1 mb-4">We will notify you when similar properties are added in {property.location?.locality || 'this area'}.</Text>
           <TouchableOpacity className="bg-white border border-primary text-primary px-6 py-2 rounded-full shadow-sm">
             <Text className="text-primary font-inter-semibold">Create Alert</Text>
           </TouchableOpacity>
        </View>
        
        {/* Scroll buffer to avoid floating bar collision */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Bar (Contact Bottom Sheet style) */}
      <View className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-4 py-3 flex-row shadow-[0_-5px_10px_rgba(0,0,0,0.05)] pt-4 pb-8">
        <TouchableOpacity className="flex-1 bg-green-500 rounded-lg flex-row items-center justify-center mr-3 h-12">
          <FontAwesome5 name="whatsapp" size={20} color="white" />
          <Text className="text-white font-inter-semibold text-base ml-2">WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-primary rounded-lg flex-row items-center justify-center h-12 shadow-sm">
          <FontAwesome5 name="phone-alt" size={16} color="white" />
          <Text className="text-white font-inter-semibold text-base ml-2">Contact</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
