import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PortfolioCard from "../components/PortfolioCard";
import HoldingCard from "./HoldingCard";

export default function Portfolio() {
  return (
    <ScrollView className="flex-1 bg-[#0B0F17] px-5 pt-14">
      <View className="flex-row items-center justify-between mb-6">
        <View> 
          <Text className="text-white text-4xl  mt-2 font-bold">
            Welcome back
          </Text>
          <Text className="text-blue-500 text-3xl font-bold">
            John
          </Text>
        </View>

        <Pressable className="h-12 w-12 rounded-full bg-blue-600 items-center justify-center">
          <Ionicons name="notifications-outline" size={22} color="white" />
        </Pressable>
      </View>

     =
      <PortfolioCard
        title="Total Portfolio Value"
        value="$ 12,000,000"
        change="$ 230.50"
        positive={true}
      />

      
      <Text className="text-white text-xl font-semibold mb-4">
        Holdings
      </Text>
    
      <HoldingCard
        symbol="AAPL"
        company="Apple Inc."
        price="$ 150.00"
        change="1.2%"
        positive />

      <HoldingCard
        symbol="GOOGL"
        company="Alphabet Inc."
        price="$ 2,750.00"
        change="-0.8%"
        positive={false}
      />

      <HoldingCard
        symbol="TSLA"
        company="Tesla Inc."
        price="$ 720.00"
        change="2.5%"
        positive
      />
    </ScrollView>
  );
}
