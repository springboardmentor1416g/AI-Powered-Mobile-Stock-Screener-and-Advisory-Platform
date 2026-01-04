import { View, Text, TouchableOpacity } from "react-native";

export default function StockCard({
  companyName,
  symbol,
  currentPrice,
  peRatio,
  avgVolume,
  onPress,
}) {
  return (
    <View className="bg-[#0B1220] border border-blue-500/40 rounded-2xl p-4 mb-5">
      
      <View className="flex-row justify-between mb-3">
        <Text className="text-blue-400 font-semibold text-base">
          {companyName}
        </Text>
        <Text className="text-white text-sm">{symbol}</Text>
      </View>

      
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-300">Current price</Text>
          <Text className="text-green-500">${currentPrice}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-300">P/E ratio</Text>
          <Text className="text-green-500">${peRatio}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-300">Average volume</Text>
          <Text className="text-white">${avgVolume}</Text>
        </View>
      </View>

   
      <TouchableOpacity
        onPress={onPress}
        className="mt-4 bg-blue-600 rounded-full py-2"
      >
        <Text className="text-center text-white font-semibold">
          Explore more
        </Text>
      </TouchableOpacity>
    </View>
  );
}
