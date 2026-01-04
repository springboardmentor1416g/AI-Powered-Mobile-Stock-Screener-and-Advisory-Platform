import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MarketAI() {
  return (
    <View className="flex-1 bg-[#0E131D]">

      
      <View className="absolute top-10 right-5 bg-blue-600 p-3 rounded-full">
        <Ionicons name="notifications-outline" size={22} color="#fff" />
      </View>

      
      <View className="flex-1 justify-center px-6">
        <Text className="text-4xl text-blue-600 font-bold text-center mb-2">
          Market AI
        </Text>

        <Text className="text-lg text-white text-center mb-8">
          Screen stocks{'\n'}
          <Text className="underline">based on your query</Text>
        </Text>

        <TextInput
          placeholder="Type your query..."
          placeholderTextColor="#9ca3af"
          className="border border-blue-600 rounded-xl px-4 py-4 text-white mb-8"
        />

        <TouchableOpacity className="bg-blue-600 py-4 rounded-xl items-center">
          <Text className="text-white font-bold text-base">
            RUN SCREENER
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
