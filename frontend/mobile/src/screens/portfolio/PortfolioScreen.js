import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import apiClient from '../../services/apiClient';

export default function PortfolioScreen() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    quantity: '',
    avgPrice: '',
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setError(null);
      const response = await apiClient.get('/portfolio');
      console.log('Portfolio response:', response.data);
      // Handle response format: { data: [...], count: N } or just [...]
      const portfolioData = response.data.data || response.data || [];
      setHoldings(Array.isArray(portfolioData) ? portfolioData : []);
    } catch (err) {
      console.error('Portfolio fetch error:', err);
      setError(err.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolio();
  };

  const calculateTotalValue = () => {
    if (!Array.isArray(holdings)) return 0;
    return holdings.reduce((sum, h) => {
      const qty = parseFloat(h.quantity) || 0;
      const price = parseFloat(h.avg_price) || 0;
      return sum + (qty * price);
    }, 0);
  };

  const addHolding = async () => {
    if (!formData.ticker.trim() || !formData.quantity || !formData.avgPrice) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await apiClient.post('/portfolio', {
        ticker: formData.ticker.toUpperCase(),
        quantity: parseInt(formData.quantity),
        avgPrice: parseFloat(formData.avgPrice),
      });
      setFormData({ ticker: '', quantity: '', avgPrice: '' });
      setShowModal(false);
      await fetchPortfolio();
      Alert.alert('Success', 'Holding added');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  const deleteHolding = async (id) => {
    try {
      await apiClient.delete(`/portfolio/${id}`);
      await fetchPortfolio();
      Alert.alert('Success', 'Holding removed');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const totalValue = calculateTotalValue();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchPortfolio}>
            <Text style={styles.retryButton}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Value</Text>
        <Text style={styles.summaryValue}>${totalValue.toFixed(2)}</Text>
        <Text style={styles.summarySubtext}>{holdings.length} holdings</Text>
      </View>

      {holdings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No holdings yet</Text>
          <Text style={styles.emptySubtext}>Add stocks you own</Text>
        </View>
      ) : (
        <FlatList
          data={holdings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.holdingCard}>
              <View style={styles.holdingInfo}>
                <Text style={styles.ticker}>{item.ticker}</Text>
                <Text style={styles.holdingDetails}>
                  {item.quantity} @ ${parseFloat(item.avg_price || 0)?.toFixed(2) || '0.00'}
                </Text>
                <Text style={styles.totalPrice}>
                  Total: ${(item.quantity * parseFloat(item.avg_price || 0)).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Delete', 'Remove this holding?', [
                    { text: 'Cancel' },
                    {
                      text: 'Delete',
                      onPress: () => deleteHolding(item.id),
                      style: 'destructive',
                    },
                  ]);
                }}
              >
                <Text style={styles.deleteButton}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Holding</Text>
            <TextInput
              style={styles.input}
              placeholder="Ticker (e.g., AAPL)"
              value={formData.ticker}
              onChangeText={(text) =>
                setFormData({ ...formData, ticker: text })
              }
              placeholderTextColor="#ccc"
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              value={formData.quantity}
              onChangeText={(text) =>
                setFormData({ ...formData, quantity: text })
              }
              keyboardType="numeric"
              placeholderTextColor="#ccc"
            />
            <TextInput
              style={styles.input}
              placeholder="Avg Price"
              value={formData.avgPrice}
              onChangeText={(text) =>
                setFormData({ ...formData, avgPrice: text })
              }
              keyboardType="decimal-pad"
              placeholderTextColor="#ccc"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={addHolding}>
                <Text style={styles.createButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#fee',
    margin: 16,
    padding: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#c33',
    marginBottom: 8,
  },
  retryButton: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  holdingCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdingInfo: {
    flex: 1,
  },
  ticker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  holdingDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
  deleteButton: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
