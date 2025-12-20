import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

type ScreenerRow = {
  ticker: string;
  "Total Revenue": number;
};

// Helper to make numbers readable (e.g. 1.2B)
const formatCurrency = (value: number) => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
};

export default function ResultsScreen() {
  const router = useRouter();
  const { results } = useLocalSearchParams<{ results?: string }>();
  
  // Parse data safely
  const data: ScreenerRow[] = results ? JSON.parse(results) : [];

  const renderItem = ({ item, index }: { item: ScreenerRow; index: number }) => (
    <View style={styles.card}>
      {/* Left Side: Ticker Icon & Name */}
      <View style={styles.tickerContainer}>
        <LinearGradient
          colors={["#3b82f6", "#1d4ed8"]}
          style={styles.logoPlaceholder}
        >
          <Text style={styles.logoText}>{item.ticker.charAt(0)}</Text>
        </LinearGradient>
        <View>
          <Text style={styles.tickerText}>{item.ticker}</Text>
          <Text style={styles.companyName}>Stock Equity</Text>
        </View>
      </View>

      {/* Right Side: Revenue Data */}
      <View style={styles.dataContainer}>
        <Text style={styles.dataLabel}>Revenue</Text>
        <Text style={styles.dataValue}>{formatCurrency(item["Total Revenue"])}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Market Results</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.listContainer}>
          <View style={styles.resultsMeta}>
            <Text style={styles.resultCount}>{data.length} Matches Found</Text>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item, index) => item.ticker + index}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="magnify-remove-outline" size={64} color="#64748b" />
                <Text style={styles.emptyText}>No stocks matched your criteria.</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#0f172a" },
  background: { position: "absolute", left: 0, right: 0, top: 0, height: "100%" },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "white" },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  listContainer: { flex: 1, paddingHorizontal: 20 },
  resultsMeta: { marginBottom: 15, marginTop: 10 },
  resultCount: { color: "#94a3b8", fontSize: 14, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },

  // Card Styles
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  tickerContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { color: "white", fontSize: 20, fontWeight: "bold" },
  tickerText: { color: "white", fontSize: 18, fontWeight: "bold" },
  companyName: { color: "#64748b", fontSize: 12 },

  dataContainer: { alignItems: "flex-end" },
  dataLabel: { color: "#64748b", fontSize: 11, marginBottom: 2 },
  dataValue: { color: "#10b981", fontSize: 16, fontWeight: "700" }, // Green for money

  // Empty State
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { color: "#64748b", marginTop: 16, fontSize: 16 },
});