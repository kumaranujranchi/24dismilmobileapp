import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Reusable PropertyCard matching the design from style.css
export default function PropertyCard({ property }: { property: any }) {
  const router = useRouter();
  
  // Provide defaults if property object is missing some fields
  const p = property || {};
  
  return (
    <TouchableOpacity
      activeOpacity={0.9} 
      className="bg-white rounded-2xl mb-5 shadow-card border border-gray-100 overflow-hidden mx-4"
      onPress={() => router.push(`/property/${p._id}`)}
    >
      {/* Property Image Header */}
      <View className="relative h-48 w-full bg-gray-200">
        <Image 
          source={{ uri: p.photos?.[0] || 'https://via.placeholder.com/800' }} 
          className="w-full h-full" 
          resizeMode="cover"
        />
        
        {/* Overlays */}
        <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-sm flex-row items-center shadow-sm">
          <FontAwesome5 name="camera" size={10} color="#2d2d2d" />
          <Text className="text-text text-[10px] font-inter-semibold ml-1">
            {p.photos?.length || 0}
          </Text>
        </View>

        <TouchableOpacity className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-sm">
          <FontAwesome5 name="heart" size={14} color="#6b7280" />
        </TouchableOpacity>

        {p.isFeatured && (
          <View className="absolute bottom-3 left-3 bg-primary px-2 py-1 rounded-sm shadow-sm">
            <Text className="text-white text-[10px] font-poppins-semibold uppercase tracking-wider">Featured</Text>
          </View>
        )}
      </View>

      {/* Property Details */}
      <View className="p-4 pt-3">
        {/* Price & Title Row */}
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-dark text-[22px] font-poppins-bold leading-tight">
             ₹{p.pricing?.expectedPrice || '0'} <Text className="text-text-muted text-xs font-poppins-regular">{p.pricing?.priceType || ''}</Text>
          </Text>
        </View>
        
        <Text className="text-text font-inter-semibold text-[15px] mb-2 leading-[1.4]" numberOfLines={2}>
          {p.details?.bhk || ''} {p.propertyType || 'Beautiful Property'} at {p.location?.society || p.location?.locality || ''}
        </Text>
        
        <View className="flex-row items-center mb-3">
          <FontAwesome5 name="map-marker-alt" size={11} color="#9ca3af" />
          <Text className="text-text-muted text-[13px] font-inter ml-1">{p.location?.locality || ''}, {p.location?.city || 'Location'}</Text>
        </View>

        {/* Specs Grid (99acres style) */}
        <View className="flex-row flex-wrap border border-border-light rounded-lg overflow-hidden mb-4">
          <View className="w-1/3 p-2 border-r border-border-light items-center justify-center bg-gray-50">
            <Text className="text-text-muted text-[10px] uppercase font-inter-medium mb-0.5">Built-up</Text>
            <Text className="text-dark text-xs font-inter-semibold">{p.details?.builtUpArea || 0} sqft</Text>
          </View>
          <View className="w-1/3 p-2 border-r border-border-light items-center justify-center bg-gray-50">
            <Text className="text-text-muted text-[10px] uppercase font-inter-medium mb-0.5">BHK</Text>
            <Text className="text-dark text-xs font-inter-semibold">{p.details?.bhk || 'N/A'}</Text>
          </View>
          <View className="w-1/3 p-2 items-center justify-center bg-gray-50">
            <Text className="text-text-muted text-[10px] uppercase font-inter-medium mb-0.5">Status</Text>
            <Text className="text-dark text-xs font-inter-semibold" numberOfLines={1}>{p.details?.status || 'Ready'}</Text>
          </View>
        </View>

        {/* Agent/Owner Strip */}
        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
          <View className="flex-row items-center flex-1">
            <View className="w-9 h-9 border border-gray-200 rounded-full bg-white items-center justify-center overflow-hidden">
               <Text className="text-text-muted font-poppins-bold text-sm">
                 {(p.contactDesc?.name || 'A')[0].toUpperCase()}
               </Text>
            </View>
            <View className="ml-2 flex-1">
              <Text className="text-text text-sm font-inter-semibold" numberOfLines={1}>{p.contactDesc?.name || 'Agent/Owner'}</Text>
              <Text className="text-text-muted text-[10px] font-inter-medium">{p.contactDesc?.role || 'Builder'}</Text>
            </View>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity className="bg-primary px-4 py-2 rounded-md mr-2 shadow-sm">
               <Text className="text-white text-xs font-inter-semibold">Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-green-50 px-3 py-2 rounded-md border border-green-200">
               <FontAwesome5 name="whatsapp" size={16} color="#16a34a" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
