import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";

function getRows(data) {
  if (!data) return [];
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.payload)) return data.payload;
  return [];
}

function getPerformanceColor(value) {
  if (!value) return "#666";
  const num = parseFloat(value);
  if (num > 0) return "#10b981";
  if (num < 0) return "#ef4444";
  return "#666";
}

const ResultCard = ({ item, onPress }) => {
  const change = parseFloat(item.change_percent) || 0;
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.tickerSection}>
          <Text style={styles.ticker}>{item.ticker}</Text>
          {item.name && <Text style={styles.name}>{item.name}</Text>}
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>${item.last_price ?? "-"}</Text>
          {change !== 0 && (
            <Text style={[styles.change, { color: getPerformanceColor(change) }]}>
              {change > 0 ? "+" : ""}{change.toFixed(2)}%
            </Text>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>P/E Ratio</Text>
          <Text style={styles.metricValue}>{item.pe_ratio ?? "-"}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>RSI</Text>
          <Text style={[styles.metricValue, { color: getPerformanceColor(item.rsi_14) }]}>
            {item.rsi_14 ?? "-"}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Dividend</Text>
          <Text style={styles.metricValue}>{item.dividend_yield ? `${item.dividend_yield}%` : "-"}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Market Cap</Text>
          <Text style={styles.metricValue}>{item.market_cap ? `$${(item.market_cap / 1e9).toFixed(2)}B` : "-"}</Text>
        </View>
      </View>

      {/* Sector Badge */}
      {item.sector && (
        <View style={styles.sectorBadge}>
          <Text style={styles.sectorText}>{item.sector}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ResultsScreen({ route, navigation }) {
  const apiData = route?.params?.data;
  const rows = getRows(apiData);
  const [selectedTicker, setSelectedTicker] = useState(null);

  const handleCardPress = (item) => {
    setSelectedTicker(item.ticker);
    // Can navigate to detail screen if needed
    // navigation.navigate("StockDetail", { ticker: item.ticker });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No Results Found</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your search criteria</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Screener Results</Text>
          <Text style={styles.resultCount}>{rows.length} stocks found</Text>
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={rows}
        keyExtractor={(item, idx) => item.ticker ?? String(idx)}
        renderItem={({ item }) => (
          <ResultCard item={item} onPress={() => handleCardPress(item)} />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={rows.length === 0 ? styles.emptyContainer : null}
        scrollIndicatorInsets={{ right: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e40af",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },
  resultCount: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    marginTop: 4,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tickerSection: {
    flex: 1,
  },
  ticker: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  priceSection: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
  },
  change: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 10,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },
  sectorBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectorText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369a1",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
