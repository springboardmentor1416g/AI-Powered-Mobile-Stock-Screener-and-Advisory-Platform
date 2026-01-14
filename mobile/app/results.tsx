import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Alert 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// ✅ Import Services for Watchlist Logic
import { useAuth } from "../context/AuthContext";
import { UserDataService } from "../services/api";

type StockResult = {
  ticker: string;
  name: string;
  sector: string;
  industry?: string;
  revenue: string | number; 
  net_income?: string | number;
  pe_ratio?: string | number;
  market_cap?: string | number;
};

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num || isNaN(num)) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
};

export default function ResultsScreen() {
  const router = useRouter();
  const { user } = useAuth(); // ✅ Get User for API calls
  const { results } = useLocalSearchParams<{ results?: string }>();
  
  let data: StockResult[] = [];
  try {
    data = results ? JSON.parse(results) : [];
  } catch (e) {
    console.error("Failed to parse results:", e);
  }

  // ✅ New Logic: Add directly to Watchlist
  const handleAddToWatchlist = async (ticker: string) => {
    if (!user) {
      Alert.alert("Login Required", "Please login to add to watchlist.");
      return;
    }

    try {
      await UserDataService.addToWatchlist(user.id, ticker);
      Alert.alert("Success", `${ticker} added to your Watchlist!`);
    } catch (error) {
      Alert.alert("Error", "Could not add to watchlist.");
    }
  };

  const renderItem = ({ item }: { item: StockResult }) => (
    // ❌ REMOVED: Navigation onPress
    // The card is now just a View (uncallable) container with interactive buttons inside
    <View style={styles.card}> 
      {/* Header Row: Icon + Ticker + Name + ADD BUTTON */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={["#3b82f6", "#1d4ed8"]}
            style={styles.logoPlaceholder}
          >
            <Text style={styles.logoText}>{item.ticker.charAt(0)}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.tickerText}>{item.ticker}</Text>
            <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
          </View>
        </View>

        {/* ✅ NEW: Add to Watchlist Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddToWatchlist(item.ticker)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#34d399" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Revenue</Text>
          <Text style={styles.statValue}>{formatCurrency(item.revenue)}</Text>
        </View>
        
        <View style={[styles.statItem, { alignItems: 'center' }]}>
           <Text style={styles.statLabel}>P/E Ratio</Text>
           <Text style={styles.statValue}>{item.pe_ratio ? Number(item.pe_ratio).toFixed(2) : '-'}</Text>
        </View>

        <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
           <Text style={styles.statLabel}>Net Income</Text>
           <Text style={[styles.statValue, { color: '#38bdf8' }]}>
             {formatCurrency(item.net_income || 0)}
           </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.background} />

      <SafeAreaView style={styles.safeArea}>
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
            keyExtractor={(item) => item.ticker}
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

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Align button with text
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { color: "white", fontSize: 20, fontWeight: "bold" },
  tickerText: { color: "white", fontSize: 18, fontWeight: "bold" },
  companyName: { color: "#64748b", fontSize: 12, maxWidth: 180 },
  
  // ✅ Style for the Add Button
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(52, 211, 153, 0.1)", // Subtle green background
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
  statLabel: { color: "#64748b", fontSize: 11, marginBottom: 2 },
  statValue: { color: "#10b981", fontSize: 15, fontWeight: "700" }, 

  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { color: "#64748b", marginTop: 16, fontSize: 16 },
});