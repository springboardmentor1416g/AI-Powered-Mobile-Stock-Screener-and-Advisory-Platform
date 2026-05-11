import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function StockCard({
  companyName,
  symbol,
  currentPrice,
  peRatio,
  roe,
  sector,
  revenue_growth_yoy,
  onPress,
  onAddToWatchlist,
  onAddToPortfolio,
  inWatchlist
}) {
  return (
    <View className="bg-[#0B1220] border border-blue-500/40 rounded-2xl p-4 mb-5">
      
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-blue-400 font-semibold text-base">
            {companyName}
          </Text>
          <Text className="text-gray-400 text-xs">{sector}</Text>
        </View>
        <Text className="text-white text-sm font-bold">{symbol}</Text>
      </View>

      
      <View className="space-y-2 mb-3">
        <View className="flex-row justify-between">
          <Text className="text-gray-300">Price</Text>
          <Text className="text-green-500 font-semibold">${parseFloat(currentPrice).toFixed(2)}</Text>
        </View>

        {peRatio && (
          <View className="flex-row justify-between">
            <Text className="text-gray-300">P/E Ratio</Text>
            <Text className="text-gray-300">{parseFloat(peRatio).toFixed(2)}</Text>
          </View>
        )}

        {roe && (
          <View className="flex-row justify-between">
            <Text className="text-gray-300">ROE</Text>
            <Text className="text-gray-300">{(roe * 100).toFixed(1)}%</Text>
          </View>
        )}

        {revenue_growth_yoy && (
          <View className="flex-row justify-between">
            <Text className="text-gray-300">Rev Growth</Text>
            <Text className="text-gray-300">{(revenue_growth_yoy * 100).toFixed(1)}%</Text>
          </View>
        )}
      </View>

      
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onAddToWatchlist}
          className={`flex-1 rounded-full py-2 flex-row justify-center items-center ${inWatchlist ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <MaterialCommunityIcons
            name={inWatchlist ? "star" : "star-outline"}
            size={16}
            color="white"
          />
          <Text className="text-white text-xs font-semibold ml-1">
            {inWatchlist ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAddToPortfolio}
          className="flex-1 bg-green-600 rounded-full py-2 flex-row justify-center items-center"
        >
          <MaterialCommunityIcons name="plus" size={16} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">Add</Text>
        </TouchableOpacity>

        {onPress && (
          <TouchableOpacity
            onPress={onPress}
            className="flex-1 bg-blue-600 rounded-full py-2 flex-row justify-center items-center"
          >
            <MaterialCommunityIcons name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
