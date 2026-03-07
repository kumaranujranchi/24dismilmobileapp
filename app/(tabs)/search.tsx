import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header / Search Input */}
      <View className="px-4 py-3 border-b border-gray-100 flex-row items-center pt-4">
         <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
           <FontAwesome5 name="arrow-left" size={20} color={Colors.text} />
         </TouchableOpacity>
         <View className="flex-1 bg-gray-50 border border-gray-200 rounded-lg flex-row items-center px-4 py-3 shadow-sm">
           <TextInput 
             className="flex-1 text-text font-inter-medium text-base ml-1"
             placeholder="Search by City, Locality, or Project"
             placeholderTextColor="#9ca3af"
             autoFocus={true}
           />
           <TouchableOpacity className="ml-2">
             <FontAwesome5 name="microphone" size={16} color={Colors.primary} />
           </TouchableOpacity>
         </View>
      </View>

      <ScrollView className="flex-1 bg-white">
        {/* Quick Filters */}
        <View className="px-4 py-4 border-b border-gray-100">
           <Text className="text-text-muted font-inter-semibold text-xs tracking-wider uppercase mb-3">Property Type</Text>
           <View className="flex-row flex-wrap">
             {['Buy', 'Rent', 'Commercial', 'PG/Co-living', 'Plots'].map((type, idx) => (
               <TouchableOpacity 
                 key={idx} 
                 className={`border rounded-full px-4 py-2 mr-3 mb-3 ${idx === 0 ? 'border-primary bg-primary/5' : 'border-gray-300 bg-white'}`}
               >
                 <Text className={`font-inter-medium text-sm ${idx === 0 ? 'text-primary' : 'text-text'}`}>{type}</Text>
               </TouchableOpacity>
             ))}
           </View>
        </View>

        {/* Recent Searches / Trendy Localities */}
        <View className="px-4 py-5">
           <View className="flex-row justify-between items-center mb-4">
             <Text className="text-dark font-poppins-semibold text-base">Popular in Patna</Text>
             <Text className="text-primary text-xs font-inter-semibold">Clear</Text>
           </View>

           <View className="mb-2">
             {[
               { name: "Gola Road, Patna", type: "Locality" },
               { name: "Danapur, Patna", type: "Locality" },
               { name: "Bailey Road, Patna", type: "Locality" },
               { name: "Bihta, Patna", type: "Area" }
             ].map((item, idx) => (
               <TouchableOpacity key={idx} className="flex-row items-center py-3 border-b border-gray-100">
                  <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3 border border-gray-100">
                    <FontAwesome5 name="map-marker-alt" size={14} color="#6b7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-dark font-inter-semibold text-[15px]">{item.name}</Text>
                    <Text className="text-text-muted font-inter text-xs mt-0.5">{item.type}</Text>
                  </View>
                  <FontAwesome5 name="arrow-up" size={12} color="#9ca3af" style={{ transform: [{ rotate: '45deg' }] }} />
               </TouchableOpacity>
             ))}
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
