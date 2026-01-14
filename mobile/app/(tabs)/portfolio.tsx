import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

// ✅ Import new Service and Components
import { UserDataService } from "../../services/api";
import { LoadingState } from "../../components/ui/LoadingState"; 
import { ErrorState } from "../../components/ui/ErrorState";

// ✅ Keep Auth Context
import { useAuth } from "../../context/AuthContext";

// Define Data Type based on your ERD/API
interface PortfolioItem {
  ticker: string;
  name: string; // Mapped from company name
  quantity: number;
  avg_buy_price: number;
  current_price: number;
}

export default function PortfolioScreen() {
  const { user } = useAuth(); 
  const [holdings, setHoldings] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPL, setTotalPL] = useState(0); // Total Profit/Loss

  const fetchPortfolio = async () => {
    if (!user || !user.id) return;

    // Only show full loader on initial fetch, not pull-to-refresh
    if (holdings.length === 0) setLoading(true);
    
    try {
      setError(false);
      // ✅ Use the Service Layer
      const data = await UserDataService.getPortfolio(user.id);
      
      // Map API response to state
      setHoldings(data);

      // 🧮 Calculate Totals
      let calculatedTotal = 0;
      let calculatedPL = 0;

      data.forEach((item: PortfolioItem) => {
        const currentValue = item.quantity * item.current_price;
        const costBasis = item.quantity * item.avg_buy_price;
        calculatedTotal += currentValue;
        calculatedPL += (currentValue - costBasis);
      });

      setTotalValue(calculatedTotal);
      setTotalPL(calculatedPL);

    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchPortfolio();
      }
    }, [user])
  );

  // Helper for P/L calculation per item
  const getProfitLoss = (item: PortfolioItem) => {
    const value = (item.current_price - item.avg_buy_price) * item.quantity;
    const percent = ((item.current_price - item.avg_buy_price) / item.avg_buy_price) * 100;
    return {
      value: value,
      percent: percent,
      isPositive: value >= 0
    };
  };

  const renderItem = ({ item }: { item: PortfolioItem }) => {
    const pl = getProfitLoss(item);

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          {/* Left Side: Ticker & Name */}
          <View>
            <Text style={styles.ticker}>{item.ticker}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.shares}>{item.quantity} shares</Text>
          </View>

          {/* Right Side: Price & P/L */}
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.price}>${item.current_price.toFixed(2)}</Text>
            <View style={styles.plContainer}>
              <Text style={[styles.change, { color: pl.isPositive ? "#34d399" : "#f87171" }]}>
                {pl.isPositive ? "+" : ""}{pl.value.toFixed(2)} ({pl.percent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // 1. Handling Not Logged In
  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>Please Log In to view your portfolio.</Text>
      </View>
    );
  }

  // 2. Handling Error State (using new UI)
  if (error && holdings.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorState onRetry={fetchPortfolio} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Portfolio</Text>
          
          <View style={styles.balanceContainer}>
            <View>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceValue}>
                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
            </View>
            {/* Total P/L Indicator */}
            <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.balanceLabel}>Total Return</Text>
                <Text style={[styles.totalPL, { color: totalPL >= 0 ? "#34d399" : "#f87171" }]}>
                    {totalPL >= 0 ? "+" : ""}${totalPL.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
            </View>
          </View>
        </View>

        {/* 3. Handling Loading State (Initial Load) */}
        {loading && holdings.length === 0 ? (
            <LoadingState /> // Use the transparent loader we built so gradient shows through? 
                             // Actually LoadingState has a white background in prev code, 
                             // might want to tweak it to transparent or check style.
        ) : (
          <FlatList
            data={holdings}
            renderItem={renderItem}
            keyExtractor={(item) => item.ticker}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchPortfolio} tintColor="white" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={48} color="#64748b" />
                <Text style={styles.emptyText}>No stocks in your portfolio yet.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  headerContainer: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 15 },
  
  balanceContainer: { 
    backgroundColor: "#334155", 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  balanceLabel: { color: "#94a3b8", fontSize: 14, marginBottom: 4 },
  balanceValue: { color: "white", fontSize: 28, fontWeight: "bold" },
  totalPL: { fontSize: 18, fontWeight: "600" },

  card: { 
    backgroundColor: "#1e293b", 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: "#334155" 
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  
  ticker: { color: "white", fontSize: 18, fontWeight: "bold" },
  name: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  shares: { color: "#64748b", fontSize: 12, marginTop: 4 },
  
  price: { color: "white", fontSize: 18, fontWeight: "600" },
  plContainer: { marginTop: 4 },
  change: { fontSize: 13, fontWeight: "500" },
  
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#64748b", marginTop: 10, fontSize: 16 },
});