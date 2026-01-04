import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StockCard from "../components/StockCard";

export default function ResultsScreen() {
  return (
    <View className="flex-1 bg-[#050B18] px-4 pt-12">
      
      <View className="flex-row justify-between items-center mb-7 mt-7">
        <View>
          <Text className="text-gray-400 text-sm">According to the query</Text>
          <Text className="text-white text-xl font-semibold">
            Here are your results...
          </Text>
        </View>

        <TouchableOpacity className="bg-blue-600 p-3 rounded-full">
          <Ionicons name="notifications-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StockCard
          companyName="Company name"
          symbol="symbol"
          currentPrice="44000"
          peRatio="44000"
          avgVolume="44000"
          onPress={() => console.log("Explore pressed")}
        />

        <StockCard
          companyName="Company name"
          symbol="symbol"
          currentPrice="44000"
          peRatio="44000"
          avgVolume="44000"
        />

        <StockCard
          companyName="Company name"
          symbol="symbol"
          currentPrice="44000"
          peRatio="44000"
          avgVolume="44000"
        />
      </ScrollView>
    </View>
  );
}
