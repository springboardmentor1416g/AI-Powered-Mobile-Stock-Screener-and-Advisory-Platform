import { View, Text } from "react-native";

export default function PortfolioCard({
  title = "Total Portfolio Value",
  value = "$ 0",
  change = "$ 0",
  positive = true,
}) {
  return (
    <View className="bg-blue-700 rounded-2xl p-5 mb-8">
      <Text className="text-white text-sm mb-2">
        {title}
      </Text>

      <Text className="text-white text-3xl font-bold mb-3">
        {value}
      </Text>

      
      <View
        className={`self-start px-4 py-1.5 rounded-full ${
          positive ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <Text
          className={`font-semibold ${
            positive ? "text-green-100" : "text-red-100"
          }`}
        >
          {change}
        </Text>
      </View>
    </View>
  );
}
