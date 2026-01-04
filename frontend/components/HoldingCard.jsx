import { View, Text } from "react-native";

export default function HoldingCard({
  symbol,
  company,
  price,
  change,
  positive = true,
}) {
  return (
    <View className="bg-[#1A1F2B] rounded-2xl px-5 py-4 mb-4 flex-row justify-between items-center">
      
      <View>
        <Text className="text-white text-lg font-bold">
          {symbol}
        </Text>
        <Text className="text-gray-400">
          {company}
        </Text>
      </View>

     
      <View className="items-end">
        <Text className="text-white text-lg font-semibold">
          {price}
        </Text>
        <Text
          className={`font-semibold ${
            positive ? "text-green-500" : "text-red-500"
          }`}
        >
          {change}
        </Text>
      </View>
    </View>
  );
}
