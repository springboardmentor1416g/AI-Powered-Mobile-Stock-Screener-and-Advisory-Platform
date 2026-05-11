import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import StockCard from "../components/StockCard";

export default function ResultsScreen() {
  const route = useRoute();
  const results = route.params?.results || [];
  const [watchlist, setWatchlist] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");

  const addToWatchlist = async (stock) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          stockData: stock
        })
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist([...watchlist, stock.symbol]);
        Alert.alert('Success', `${stock.symbol} added to watchlist`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to watchlist');
    }
  };

  const removeFromWatchlist = async (stock) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/watchlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: stock.symbol })
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist(watchlist.filter(s => s !== stock.symbol));
        Alert.alert('Success', `${stock.symbol} removed from watchlist`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove from watchlist');
    }
  };

  const openAddPortfolioModal = (stock) => {
    setSelectedStock(stock);
    setQuantity("");
    setCostPrice("");
    setAddModalVisible(true);
  };

  const addToPortfolio = async () => {
    if (!quantity || !costPrice) {
      Alert.alert('Error', 'Please enter quantity and cost price');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          stockData: selectedStock,
          quantity: parseFloat(quantity),
          costPrice: parseFloat(costPrice)
        })
      });
      const data = await response.json();
      if (data.success) {
        setAddModalVisible(false);
        Alert.alert('Success', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to portfolio');
    }
  };

  return (
    <View className="flex-1 bg-[#050B18] px-4 pt-12">
      
      <View className="flex-row justify-between items-center mb-7 mt-7">
        <View>
          <Text className="text-gray-400 text-sm">According to the query</Text>
          <Text className="text-white text-xl font-semibold">
            Here are your results...
          </Text>
        </View>

        <TouchableOpacity className="bg-blue-600 p-3 rounded-full">
          <Ionicons name="notifications-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {results.map((stock, index) => (
          <StockCard
            key={index}
            companyName={stock.name}
            symbol={stock.symbol}
            currentPrice={stock.price?.toString() || "N/A"}
            peRatio={stock.pe_ratio?.toString() || "N/A"}
            roe={stock.roe}
            sector={stock.sector}
            revenue_growth_yoy={stock.revenue_growth_yoy}
            inWatchlist={watchlist.includes(stock.symbol)}
            onAddToWatchlist={() => {
              if (watchlist.includes(stock.symbol)) {
                removeFromWatchlist(stock);
              } else {
                addToWatchlist(stock);
              }
            }}
            onAddToPortfolio={() => openAddPortfolioModal(stock)}
            onPress={() => console.log("Explore pressed", stock.symbol)}
          />
        ))}
      </ScrollView>

      {/* Add to Portfolio Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-gray-900 rounded-t-2xl p-6 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Add to Portfolio</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {selectedStock && (
              <>
                <Text className="text-white font-semibold mb-2">{selectedStock.symbol} - {selectedStock.name}</Text>

                <TextInput
                  placeholder="Quantity"
                  placeholderTextColor="#999"
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg mb-3 border border-gray-700"
                  keyboardType="decimal-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />

                <TextInput
                  placeholder="Cost Price per Unit"
                  placeholderTextColor="#999"
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg mb-4 border border-gray-700"
                  keyboardType="decimal-pad"
                  value={costPrice}
                  onChangeText={setCostPrice}
                />

                <TouchableOpacity
                  onPress={addToPortfolio}
                  className="bg-green-600 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">Add Holding</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
