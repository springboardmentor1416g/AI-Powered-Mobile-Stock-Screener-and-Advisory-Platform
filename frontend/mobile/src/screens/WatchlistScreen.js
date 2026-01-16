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
import watchlistService from '../../services/watchlist.service';
import { useAuth } from '../../contexts/AuthContext';

const WatchlistScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newStockTicker, setNewStockTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load watchlists
  const loadWatchlists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await watchlistService.getUserWatchlists();
      setWatchlists(data);
      if (data.length > 0 && !selectedWatchlist) {
        setSelectedWatchlist(data[0]);
        await loadWatchlistItems(data[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load watchlists');
      console.error('Error loading watchlists:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedWatchlist]);

  // Load watchlist items
  const loadWatchlistItems = useCallback(async (watchlistId) => {
    try {
      const data = await watchlistService.getWatchlist(watchlistId);
      setWatchlistItems(data.items || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load watchlist items');
      console.error('Error loading watchlist items:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWatchlists();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWatchlists();
    if (selectedWatchlist) {
      await loadWatchlistItems(selectedWatchlist.id);
    }
    setRefreshing(false);
  }, [selectedWatchlist]);

  // Create new watchlist
  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }

    try {
      setLoading(true);
      await watchlistService.createWatchlist(newWatchlistName);
      setNewWatchlistName('');
      setShowWatchlistModal(false);
      await loadWatchlists();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create watchlist');
    } finally {
      setLoading(false);
    }
  };

  // Add stock to watchlist
  const handleAddStock = async () => {
    if (!selectedWatchlist) {
      Alert.alert('Error', 'Please select a watchlist');
      return;
    }

    if (!newStockTicker.trim()) {
      Alert.alert('Error', 'Please enter a stock ticker');
      return;
    }

    try {
      setLoading(true);
      await watchlistService.addToWatchlist(selectedWatchlist.id, newStockTicker.toUpperCase());
      setNewStockTicker('');
      setShowAddStockModal(false);
      await loadWatchlistItems(selectedWatchlist.id);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  // Remove stock from watchlist
  const handleRemoveStock = async (ticker) => {
    if (!selectedWatchlist) return;

    Alert.alert(
      'Confirm',
      `Remove ${ticker} from watchlist?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              await watchlistService.removeFromWatchlist(selectedWatchlist.id, ticker);
              await loadWatchlistItems(selectedWatchlist.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove stock');
            }
          }
        }
      ]
    );
  };

  // Delete watchlist
  const handleDeleteWatchlist = async (watchlistId) => {
    Alert.alert(
      'Confirm',
      'Delete this watchlist?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await watchlistService.deleteWatchlist(watchlistId);
              if (selectedWatchlist?.id === watchlistId) {
                setSelectedWatchlist(null);
                setWatchlistItems([]);
              }
              await loadWatchlists();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete watchlist');
            }
          }
        }
      ]
    );
  };

  const renderWatchlistItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.watchlistItem,
        selectedWatchlist?.id === item.id && styles.watchlistItemSelected
      ]}
      onPress={async () => {
        setSelectedWatchlist(item);
        await loadWatchlistItems(item.id);
      }}
      onLongPress={() => handleDeleteWatchlist(item.id)}
    >
      <View style={styles.watchlistItemContent}>
        <Text style={styles.watchlistItemName}>{item.name}</Text>
        <Text style={styles.watchlistItemCount}>{item.item_count} stocks</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  const renderStockItem = ({ item }) => (
    <View style={styles.stockItem}>
      <TouchableOpacity
        style={styles.stockItemContent}
        onPress={() => navigation.navigate('CompanyDetail', { ticker: item.ticker })}
      >
        <View>
          <Text style={styles.stockTicker}>{item.ticker}</Text>
          <Text style={styles.stockName}>{item.company_name || 'Unknown'}</Text>
          {item.notes && <Text style={styles.stockNotes}>{item.notes}</Text>}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveStock(item.ticker)}
      >
        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  if (loading && watchlists.length === 0) {
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
        <Text style={styles.headerTitle}>My Watchlists</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowWatchlistModal(true)}
        >
          <Ionicons name="add-circle" size={28} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Watchlists List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Watchlists</Text>
          {watchlists.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={48} color="#999" />
              <Text style={styles.emptyStateText}>No watchlists yet</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowWatchlistModal(true)}
              >
                <Text style={styles.createButtonText}>Create Your First Watchlist</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={watchlists}
              renderItem={renderWatchlistItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Selected Watchlist Stocks */}
        {selectedWatchlist && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{selectedWatchlist.name}</Text>
              <TouchableOpacity
                style={styles.addStockButton}
                onPress={() => setShowAddStockModal(true)}
              >
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {watchlistItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No stocks in this watchlist</Text>
              </View>
            ) : (
              <FlatList
                data={watchlistItems}
                renderItem={renderStockItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Watchlist Modal */}
      <Modal visible={showWatchlistModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Watchlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Watchlist name"
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              placeholderTextColor="#999"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewWatchlistName('');
                  setShowWatchlistModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateWatchlist}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Stock Modal */}
      <Modal visible={showAddStockModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock to Watchlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Stock ticker (e.g., AAPL)"
              value={newStockTicker}
              onChangeText={(text) => setNewStockTicker(text.toUpperCase())}
              placeholderTextColor="#999"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewStockTicker('');
                  setShowAddStockModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddStock}
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
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
    color: '#374151',
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  watchlistItemSelected: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  watchlistItemContent: {
    flex: 1,
  },
  watchlistItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  watchlistItemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  stockItem: {
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
  stockItemContent: {
    flex: 1,
  },
  stockTicker: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  stockName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  stockNotes: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
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
  addStockButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
    fontSize: 14,
    color: '#111',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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

export default WatchlistScreen;
