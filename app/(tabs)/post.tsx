import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function PostScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-4">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-dark text-2xl font-poppins-bold mb-2">Sell or Rent your Property for Free</Text>
        <Text className="text-text-muted text-center font-inter mb-8">Reach millions of buyers. Get higher value for your property.</Text>
        <TouchableOpacity className="bg-primary px-8 py-3 rounded-md w-full items-center shadow-md">
          <Text className="text-white font-poppins-semibold text-base">Start Posting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
