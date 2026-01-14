import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { UserDataService } from '../../services/api';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

interface WatchlistItem {
  ticker: string;
  name: string;
  current_price: number;
  change?: number; // Optional daily change %
}

export default function WatchlistScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Function to fetch data
  const fetchWatchlist = async () => {
    if (!user || !user.id) return;

    // Show full loader only on first mount, not during refresh
    if (watchlist.length === 0 && !refreshing) setLoading(true);

    try {
      setError(false);
      const data = await UserDataService.getWatchlist(user.id);
      setWatchlist(data);
    } catch (e) {
      console.error("Watchlist Fetch Error:", e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) fetchWatchlist();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchWatchlist();
  };

  // Handle Remove Item
  const handleRemove = async (ticker: string) => {
    if(!user) return;
    
    // Optimistic Update: Remove from UI immediately
    const prevList = [...watchlist];
    setWatchlist(watchlist.filter(item => item.ticker !== ticker));

    try {
        await UserDataService.removeFromWatchlist(user.id, ticker);
    } catch (error) {
        Alert.alert("Error", "Could not remove item.");
        setWatchlist(prevList); // Revert on failure
    }
  };

  const renderItem = ({ item }: { item: WatchlistItem }) => (
    <View style={styles.cardContainer}>
        {/* Main Card Click -> Go to Details */}
        <TouchableOpacity 
            style={styles.cardContent}
            onPress={() => router.push({
                pathname: "/company/[ticker]",
                params: { ticker: item.ticker }
            })}
        >
            <View style={styles.leftColumn}>
                {/* Logo Placeholder - Matches Results Page Style */}
                <LinearGradient
                  colors={["#3b82f6", "#1d4ed8"]}
                  style={styles.logoPlaceholder}
                >
                  <Text style={styles.logoText}>{item.ticker.charAt(0)}</Text>
                </LinearGradient>
                <View>
                    <Text style={styles.ticker}>{item.ticker}</Text>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>
                    ${item.current_price ? item.current_price.toFixed(2) : "0.00"}
                </Text>
                {item.change !== undefined && (
                    <Text style={[styles.change, { color: item.change >= 0 ? '#34d399' : '#f87171' }]}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </Text>
                )}
            </View>
        </TouchableOpacity>

        {/* Delete Button (Trash Icon) */}
        <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleRemove(item.ticker)}
        >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
    </View>
  );

  // 1. Not Logged In State
  if (!user) {
    return (
      <View style={styles.centered}>
        <StatusBar style="light" />
        <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />
        <Text style={styles.emptyText}>Please Log In to view your watchlist.</Text>
      </View>
    );
  }

  // 2. Error State
  if (error && watchlist.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />
        <ErrorState onRetry={fetchWatchlist} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Watchlist</Text>
          <View style={styles.countBadge}>
             <Text style={styles.countText}>{watchlist.length} Items</Text>
          </View>
        </View>

        {/* 3. Loading State (Initial) */}
        {loading && watchlist.length === 0 ? (
          <LoadingState />
        ) : (
          <FlatList
            data={watchlist}
            keyExtractor={(item) => item.ticker}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor="white" 
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="eye-off-outline" size={64} color="#64748b" />
                <Text style={styles.emptyText}>Your watchlist is empty.</Text>
                <Text style={styles.subText}>Search for stocks to track them here.</Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#0f172a" },
  
  // Header
  headerContainer: { 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "white" },
  countBadge: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 12 
  },
  countText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },

  // Card Styles
  cardContainer: { 
    flexDirection: 'row',
    backgroundColor: "#1e293b", 
    borderRadius: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: "rgba(255,255,255,0.05)",
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  cardContent: {
    flex: 1,
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    padding: 16,
  },
  leftColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  
  // Logo Placeholder
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { color: "white", fontSize: 18, fontWeight: "bold" },

  // Delete Button
  deleteButton: {
    width: 60,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.05)",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)' // Slight red tint
  },

  // Typography
  ticker: { color: "white", fontSize: 16, fontWeight: "bold" },
  name: { color: "#94a3b8", fontSize: 12, marginTop: 2, maxWidth: 140 },
  
  price: { color: "white", fontSize: 16, fontWeight: "700" },
  change: { fontSize: 12, marginTop: 2, fontWeight: "600" },

  // Empty State
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#e2e8f0", marginTop: 16, fontSize: 18, fontWeight: '600' },
  subText: { color: "#64748b", marginTop: 8, fontSize: 14 },
});