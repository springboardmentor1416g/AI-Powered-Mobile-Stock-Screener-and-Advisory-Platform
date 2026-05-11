import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState({
    holdings: [],
    totalInvested: 0,
    currentValue: 0,
    totalReturn: 0,
    returnPercent: 0
  });
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      fetchPortfolio();
    }, [])
  );

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/portfolio');
      const data = await response.json();
      if (data.success) {
        setPortfolio(data.portfolio);
      }
    } catch (error) {
      console.log('Could not fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  const removeHolding = async (symbol) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/portfolio/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      const data = await response.json();
      if (data.success) {
        setPortfolio(data.portfolio);
        Alert.alert('Success', `${symbol} removed from portfolio`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove holding');
    }
  };

  const openAddModal = (stock) => {
    setSelectedStock(stock);
    setQuantity("");
    setCostPrice("");
    setAddModalVisible(true);
  };

  const addHolding = async () => {
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
        setPortfolio(data.portfolio);
        setAddModalVisible(false);
        Alert.alert('Success', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add holding');
    }
  };

  const formatCurrency = (value) => {
    return `$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  return (
    <View className="flex-1 bg-[#050B18] px-4 pt-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">Portfolio</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity className="bg-blue-600 p-2 rounded-full">
            <Ionicons name="download" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Portfolio Summary */}
      <View className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-4 mb-6">
        <View className="mb-3">
          <Text className="text-gray-300 text-sm">Total Invested</Text>
          <Text className="text-white text-2xl font-bold">
            {formatCurrency(portfolio.totalInvested)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-gray-300 text-sm">Current Value</Text>
            <Text className="text-white font-semibold">
              {formatCurrency(portfolio.currentValue)}
            </Text>
          </View>
          <View>
            <Text className="text-gray-300 text-sm">Total Return</Text>
            <Text className={`font-semibold ${portfolio.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio.totalReturn >= 0 ? '+' : ''}{formatCurrency(portfolio.totalReturn)}
            </Text>
          </View>
          <View>
            <Text className="text-gray-300 text-sm">Return %</Text>
            <Text className={`font-semibold ${portfolio.returnPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio.returnPercent >= 0 ? '+' : ''}{portfolio.returnPercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Holdings */}
      {portfolio.holdings.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="briefcase-outline" size={48} color="gray" />
          <Text className="text-gray-400 text-lg mt-4">No holdings yet</Text>
          <Text className="text-gray-500 text-sm mt-2">Search stocks and add them to your portfolio</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Text className="text-gray-400 text-sm mb-3">Your Holdings ({portfolio.holdings.length})</Text>
          {portfolio.holdings.map((holding, index) => (
            <View key={index} className="bg-gray-900 rounded-lg p-3 mb-3 border border-gray-700">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-white font-semibold">{holding.symbol}</Text>
                  <Text className="text-gray-400 text-xs">{holding.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeHolding(holding.symbol)}
                  className="p-1"
                >
                  <Ionicons name="trash" size={16} color="red" />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between gap-2 text-xs mb-2">
                <View className="flex-1">
                  <Text className="text-gray-400">Quantity</Text>
                  <Text className="text-white font-semibold">{holding.quantity.toFixed(2)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400">Avg Cost</Text>
                  <Text className="text-white font-semibold">${holding.avgCostPrice.toFixed(2)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400">Current</Text>
                  <Text className="text-white font-semibold">${holding.currentPrice.toFixed(2)}</Text>
                </View>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-700">
                <Text className="text-gray-400 text-xs">Gain / Loss</Text>
                <Text className={`font-semibold text-xs ${holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {holding.gain >= 0 ? '+' : ''}{formatCurrency(holding.gain)} ({holding.gainPercent.toFixed(2)}%)
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Holding Modal */}
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
                  onPress={addHolding}
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
