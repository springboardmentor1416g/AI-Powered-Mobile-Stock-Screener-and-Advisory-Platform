import { Button, Alert } from "react-native";
import { addToWatchlist } from "../src/services/api";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function CompanyDetailScreen() {
  const params = useLocalSearchParams();
  const company = params.data ? JSON.parse(params.data as string) : null;

  if (!company) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>
        Loading company details...
      </Text>
    </View>
  );
  }
  const mockNews = [
    {
      title: "Company reports strong quarterly earnings",
      date: "2024-01-10",
    },
    {
      title: "Brokerage upgrades stock outlook",
      date: "2024-01-05",
    },
  ];

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        {company.symbol}
      </Text>

      <View style={{ marginTop: 10, marginBottom: 10 }}>
        <Button
          title="Add to Watchlist"
          onPress={async () => {
            try {
              await addToWatchlist(company.symbol);
              Alert.alert("Success", "Added to watchlist");
            } catch (err) {
              Alert.alert("Error", "Failed to add to watchlist");
            }
          }}
        />
      </View>

      <Text style={{ marginTop: 10 }}>PE Ratio: {company.pe_ratio}</Text>
      <Text>Promoter Holding: {company.promoter_holding}%</Text>

      <Text style={{ marginTop: 30, fontSize: 18, fontWeight: "bold" }}>
        Price Trend (Mock)
      </Text>

      <LineChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              data: [120, 130, 125, 140, 150],
            },
          ],
        }}
        width={Dimensions.get("window").width - 40}
        height={220}
        yAxisLabel="₹"
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: () => "#2e86de",
          labelColor: () => "#333",
        }}
        style={{ marginVertical: 10 }}
      />

      <Text style={{ marginTop: 30, fontSize: 18, fontWeight: "bold" }}>
        Latest News
      </Text>

      {mockNews.map((news, index) => (
        <View key={index} style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "600" }}>{news.title}</Text>
          <Text style={{ color: "#666", fontSize: 12 }}>{news.date}</Text>
        </View>
      ))}
      <Text style={{ marginTop: 20, fontSize: 18 }}>
        (Quarterly & TTM metrics will go here)
      </Text>
    </ScrollView>
  );
}
