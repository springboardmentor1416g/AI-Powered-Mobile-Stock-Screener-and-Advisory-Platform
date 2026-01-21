import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Papa from "papaparse";

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse backend data
  const results = params.data ? JSON.parse(params.data as string) : [];
  const error = params.error;

  // Loading state
  if (!params.data && !error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading results...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>
          Something went wrong
        </Text>
        <Text>Please try again.</Text>
      </View>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 16 }}>
          No stocks matched your criteria. Try adjusting your filters.
        </Text>
      </View>
    );
  }

  // Results state
  function exportCSV(data: any[]) {
  const csv = Papa.unparse(data);
  console.log(csv);
  alert("CSV generated! Check the console output.");
}
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: "#ffffff",
      }}
    >
        <Button
        title="Export Results as CSV"
        onPress={() => exportCSV(results)}
        />
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Screener Results
      </Text>

      {results.map((item: any) => (
        <Pressable
          key={item.symbol}
          onPress={() =>
            router.push({
              pathname: "/company",
              params: {
                data: JSON.stringify(item),
              },
            })
          }
        >
          <View
            style={{
              padding: 15,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              backgroundColor: "#f9f9f9",
            }}
          >
            {/* Stock basic info */}
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {item.symbol}
            </Text>

            <Text>PE Ratio: {item.pe_ratio}</Text>
            <Text>Promoter Holding: {item.promoter_holding}%</Text>

            {/* STEP 2.1 — Why it matched */}
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#555",
              }}
            >
              Matched: PE &lt; 10, Promoter Holding &gt; 50
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
