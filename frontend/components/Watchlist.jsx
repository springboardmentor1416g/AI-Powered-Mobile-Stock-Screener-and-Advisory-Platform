import { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchWatchlist();
    }, [])
  );

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/watchlist');
      const data = await response.json();
      if (data.success) {
        setWatchlist(data.watchlist);
      }
    } catch (_error) {
      console.log('Could not fetch watchlist (backend may not be running)');
      // Fallback to mock data
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/watchlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist(data.watchlist);
        Alert.alert('Success', `${symbol} removed from watchlist`);
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to remove from watchlist');
    }
  };

  return (
    <View className="flex-1 bg-[#050B18] px-4 pt-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">My Watchlist</Text>
        <TouchableOpacity className="bg-blue-600 p-2 rounded-full">
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading watchlist...</Text>
        </View>
      ) : watchlist.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="star-outline" size={48} color="gray" />
          <Text className="text-gray-400 text-lg mt-4">No stocks in watchlist</Text>
          <Text className="text-gray-500 text-sm mt-2">Search and save stocks to track them</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {watchlist.map((stock, index) => (
            <View key={index} className="bg-gray-900 rounded-lg p-4 mb-3 border border-gray-700 flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white font-semibold">{stock.symbol}</Text>
                <Text className="text-gray-400 text-sm">{stock.name}</Text>
                <Text className="text-blue-400 font-bold mt-1">${parseFloat(stock.price).toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFromWatchlist(stock.symbol)}
                className="p-2 bg-red-600 rounded-full ml-2"
              >
                <Ionicons name="trash" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

