import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MarketService, UserDataService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { StockChart } from '../../components/StockChart';

import { AlertBuilder } from '../../components/AlertBuilder';

export default function CompanyDetailScreen() {
  const router = useRouter();
  const { ticker } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // 1. Check if already in watchlist
  const checkWatchlistStatus = async () => {
    if (!user || !user.id) return;
    try {
      const watchlist = await UserDataService.getWatchlist(user.id);
      const exists = watchlist.some((item: any) => item.ticker === ticker);
      setIsWatchlisted(exists);
    } catch (e) {
      console.log("Could not check watchlist status");
    }
  };

  // 2. Fetch Data
  const fetchData = async () => {
    try {
      setStatus('loading');
      await checkWatchlistStatus(); // Check this first
      const result = await MarketService.getCompanyDetails(ticker as string);
      setData(result);
      setStatus('success');
    } catch (e) {
      console.error("Fetch Error:", e);
      setStatus('error');
    }
  };

  useEffect(() => { 
    if (ticker) fetchData(); 
  }, [ticker]);

  // 3. Handle Add/Remove
  const handleToggleWatchlist = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to track stocks.");
      return;
    }

    try {
      if (isWatchlisted) {
        await UserDataService.removeFromWatchlist(user.id, ticker as string);
        setIsWatchlisted(false);
        Alert.alert("Removed", `${ticker} removed from Watchlist.`);
      } else {
        await UserDataService.addToWatchlist(user.id, ticker as string);
        setIsWatchlisted(true);
        Alert.alert("Success", `${ticker} added to Watchlist! ❤️`);
      }
    } catch (error) {
      Alert.alert("Error", "Could not update watchlist.");
    }
  };

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState onRetry={fetchData} />;

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* ✅ FIXED HEADER LAYOUT */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
               <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
                <Text style={styles.ticker}>{ticker}</Text>
                <Text style={styles.name}>{data?.name || "Loading..."}</Text>
            </View>

            {/* ❤️ Heart Button - Now explicitly sized and colored */}
            <TouchableOpacity 
                onPress={handleToggleWatchlist} 
                style={styles.iconButton}
            >
              <Ionicons 
                name={isWatchlisted ? "heart" : "heart-outline"} 
                size={28} 
                color={isWatchlisted ? "#ef4444" : "white"} 
              />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Price Section */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${data?.price?.toFixed(2)}</Text>
            <Text style={[styles.change, { color: (data?.change || 0) > 0 ? '#34d399' : '#f87171' }]}>
              {(data?.change || 0) > 0 ? '+' : ''}{data?.change}% Today
            </Text>
          </View>

          {/* Chart Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Price History (1Y)</Text>
            <StockChart 
               range="1Y" 
               data={[{ timestamp: 1625000000, value: 150 }]} 
            />
          </View>

          {/* Analyst Ratings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Analyst Consensus</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Rating:</Text>
              <Text style={styles.valueHighlight}>{data?.consensus_rating || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Avg Target:</Text>
              <Text style={styles.value}>${data?.price_target_avg || '0.00'}</Text>
            </View>
          </View>

          {/* Fundamentals */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fundamentals</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Mkt Cap</Text>
                <Text style={styles.value}>{data?.market_cap || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>P/E Ratio</Text>
                <Text style={styles.value}>{data?.pe_ratio || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>ROE</Text>
                <Text style={styles.value}>{data?.roe || '-'}</Text>
              </View>
            </View>
          </View>

          {user && <AlertBuilder ticker={ticker as string} userId={user.id} />}
   
   <View style={{ height: 40 }} />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { paddingBottom: 40 },
  
  // ✅ HEADER STYLES
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  backButton: { 
    width: 40, height: 40, 
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 12 
  },
  iconButton: { 
    width: 40, height: 40, 
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 12 
  },
  headerTitleContainer: { 
    flex: 1, 
    alignItems: 'center',
    marginHorizontal: 10
  },
  ticker: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  name: { fontSize: 12, color: '#94a3b8' },

  priceContainer: { alignItems: 'center', marginVertical: 20 },
  price: { fontSize: 36, fontWeight: 'bold', color: 'white' },
  change: { fontSize: 16, fontWeight: '600', marginTop: 4 },

  card: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#cbd5e1', marginBottom: 15 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 8 },
  
  label: { color: '#94a3b8', fontSize: 14 },
  value: { color: 'white', fontSize: 15, fontWeight: '600' },
  valueHighlight: { color: '#3b82f6', fontSize: 15, fontWeight: 'bold' },

  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridItem: { alignItems: 'center', flex: 1 },
});