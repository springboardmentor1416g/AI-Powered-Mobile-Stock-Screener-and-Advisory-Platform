import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function CompanyDetailScreen() {
  const params = useLocalSearchParams();
  const company = params.data ? JSON.parse(params.data as string) : null;

  if (!company) {
    return <Text>No company data available</Text>;
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        {company.symbol}
      </Text>

      <Text style={{ marginTop: 10 }}>PE Ratio: {company.pe_ratio}</Text>
      <Text>Promoter Holding: {company.promoter_holding}%</Text>

      <Text style={{ marginTop: 20, fontSize: 18 }}>
        (Quarterly & TTM metrics will go here)
      </Text>
    </ScrollView>
  );
}
