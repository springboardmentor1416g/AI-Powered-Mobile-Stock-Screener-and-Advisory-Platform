import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import portfolioService from '../../services/portfolio.service';

const PortfolioScreen = ({ navigation }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newAvgPrice, setNewAvgPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({ totalValue: 0, totalCost: 0, totalGain: 0 });

  // Load portfolio
  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);
      calculateTotals(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load portfolio');
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate portfolio totals
  const calculateTotals = (holdings) => {
    let totalCost = 0;
    holdings.forEach(holding => {
      totalCost += (holding.quantity || 0) * (holding.avg_price || 0);
    });
    setTotals({
      totalCost,
      totalValue: 0, // Will be updated with live prices
      totalGain: 0
    });
  };

  // Initial load
  useEffect(() => {
    loadPortfolio();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPortfolio();
    setRefreshing(false);
  }, []);

  // Add holding
  const handleAddHolding = async () => {
    if (!newTicker.trim()) {
      Alert.alert('Error', 'Please enter a stock ticker');
      return;
    }

    try {
      setLoading(true);
      await portfolioService.addToPortfolio(
        newTicker.toUpperCase(),
        newQuantity ? parseFloat(newQuantity) : null,
        newAvgPrice ? parseFloat(newAvgPrice) : null
      );
      setNewTicker('');
      setNewQuantity('');
      setNewAvgPrice('');
      setShowAddModal(false);
      await loadPortfolio();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add holding');
    } finally {
      setLoading(false);
    }
  };

  // Edit holding
  const handleEditHolding = async (ticker, quantity, avgPrice) => {
    try {
      setLoading(true);
      await portfolioService.updatePortfolioEntry(ticker, quantity, avgPrice);
      await loadPortfolio();
    } catch (error) {
      Alert.alert('Error', 'Failed to update holding');
    } finally {
      setLoading(false);
    }
  };

  // Remove holding
  const handleRemoveHolding = async (ticker) => {
    Alert.alert(
      'Confirm',
      `Remove ${ticker} from portfolio?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              await portfolioService.removeFromPortfolio(ticker);
              await loadPortfolio();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove holding');
            }
          }
        }
      ]
    );
  };

  const renderHoldingItem = ({ item }) => (
    <View style={styles.holdingItem}>
      <TouchableOpacity
        style={styles.holdingContent}
        onPress={() => navigation.navigate('CompanyDetail', { ticker: item.ticker })}
      >
        <View>
          <Text style={styles.ticker}>{item.ticker}</Text>
          <Text style={styles.companyName}>{item.company_name || 'Unknown'}</Text>
        </View>
        <View style={styles.holdingDetails}>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
          <Text style={styles.avgPrice}>Avg: ${parseFloat(item.avg_price || 0).toFixed(2)}</Text>
          <Text style={styles.totalCost}>
            ${((item.quantity || 0) * (item.avg_price || 0)).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.holdingActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Show edit modal
            Alert.prompt(
              'Edit Quantity',
              'Enter new quantity',
              (text) => {
                if (text) {
                  handleEditHolding(item.ticker, parseFloat(text), item.avg_price);
                }
              },
              'plain-text',
              item.quantity?.toString()
            );
          }}
        >
          <Ionicons name="pencil" size={18} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveHolding(item.ticker)}
        >
          <Ionicons name="trash" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && portfolio.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={28} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Portfolio Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Cost</Text>
            <Text style={styles.summaryValue}>
              ${totals.totalCost.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Holdings</Text>
            <Text style={styles.summaryValue}>{portfolio.length}</Text>
          </View>
        </View>

        {/* Holdings List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Holdings</Text>
          {portfolio.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color="#999" />
              <Text style={styles.emptyStateText}>No holdings yet</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.createButtonText}>Add Your First Holding</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={portfolio}
              renderItem={renderHoldingItem}
              keyExtractor={(item) => item.ticker}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Holding Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock to Portfolio</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Stock ticker (e.g., AAPL)"
              value={newTicker}
              onChangeText={(text) => setNewTicker(text.toUpperCase())}
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Quantity (optional)"
              value={newQuantity}
              onChangeText={setNewQuantity}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Average price (optional)"
              value={newAvgPrice}
              onChangeText={setNewAvgPrice}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewTicker('');
                  setNewQuantity('');
                  setNewAvgPrice('');
                  setShowAddModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddHolding}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  addButton: {
    padding: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryItem: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
    color: '#374151',
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  holdingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticker: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  companyName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  holdingDetails: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 12,
    color: '#666',
  },
  avgPrice: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  totalCost: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    marginTop: 2,
  },
  holdingActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  createButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#111',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#2563EB',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default PortfolioScreen;
