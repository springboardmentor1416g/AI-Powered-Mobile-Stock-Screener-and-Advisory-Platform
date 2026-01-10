import { View, Text } from "react-native";

export default function StockCard({ stock }) {
  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderRadius: 6,
        marginVertical: 6
      }}
    >
      <Text style={{ fontWeight: "bold" }}>{stock.symbol}</Text>
      <Text>PE: {stock.pe}</Text>
      <Text>Promoter Holding: {stock.promoterHolding}%</Text>
    </View>
  );
}
