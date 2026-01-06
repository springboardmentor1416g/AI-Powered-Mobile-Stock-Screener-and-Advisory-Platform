import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

// Import Auth Context to get the real logged-in user
import { useAuth } from "../../context/AuthContext";

// 🔧 CONFIG: Use 'localhost' if running on Simulator/Emulator with bridge
// Otherwise use your computer's local IP (e.g., 192.168.1.X)
const API_URL = "http://localhost:4000/api/portfolio"; 

export default function PortfolioScreen() {
  const { user } = useAuth(); // ✅ Get the actual logged-in user
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  const fetchPortfolio = async () => {
    // 🔒 Security Check: Don't fetch if user is not logged in
    if (!user || !user.id) return;

    setLoading(true);
    try {
      // ✅ Use the REAL User ID here
      const res = await fetch(`${API_URL}?userId=${user.id}`);
      const data = await res.json();

      if (data.success) {
        setHoldings(data.holdings);
        
        // Calculate Total Portfolio Value
        const total = data.holdings.reduce((sum: number, item: any) => {
          return sum + (Number(item.quantity) * Number(item.current_price || 0));
        }, 0);
        setTotalValue(total);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load portfolio. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Reload data whenever screen is focused OR user changes
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchPortfolio();
      }
    }, [user]) // ✅ dependency ensures reload on login/logout
  );

  const renderItem = ({ item }: { item: any }) => {
    const isProfitable = item.current_price >= item.avg_buy_price;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.ticker}>{item.ticker}</Text>
            <Text style={styles.name}>{item.company_name}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.price}>${Number(item.current_price).toFixed(2)}</Text>
            <Text style={[styles.change, { color: isProfitable ? "#34d399" : "#f87171" }]}>
              {item.quantity} shares
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Portfolio</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceValue}>
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Holdings List */}
        {!user ? (
          // State when NOT logged in (Edge case)
          <View style={styles.emptyState}>
             <Text style={styles.emptyText}>Please Log In to view your portfolio.</Text>
          </View>
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
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={48} color="#64748b" />
                <Text style={styles.emptyText}>No stocks in your portfolio yet.</Text>
              </View>
            ) : null
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
  balanceContainer: { backgroundColor: "#334155", borderRadius: 16, padding: 20, marginBottom: 10 },
  balanceLabel: { color: "#94a3b8", fontSize: 14, marginBottom: 4 },
  balanceValue: { color: "white", fontSize: 32, fontWeight: "bold" },
  card: { backgroundColor: "#1e293b", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ticker: { color: "white", fontSize: 18, fontWeight: "bold" },
  name: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  price: { color: "white", fontSize: 18, fontWeight: "600" },
  change: { fontSize: 13, marginTop: 2 },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#64748b", marginTop: 10, fontSize: 16 },
});