import { View, Text, SafeAreaView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SavedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
          <FontAwesome5 name="heart" size={32} color="#e84118" />
        </View>
        <Text className="text-dark text-xl font-poppins-bold mb-2">No Saved Properties</Text>
        <Text className="text-text-muted text-center font-inter">Properties you save will appear here for quick access later.</Text>
      </View>
    </SafeAreaView>
  );
}
