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

export default function WatchlistScreen() {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    try {
      setError(null);
      const response = await apiClient.get('/watchlists');
      console.log('Watchlists response:', response.data);
      const watchlistsData = response.data.data || response.data || [];
      setWatchlists(Array.isArray(watchlistsData) ? watchlistsData : []);
    } catch (err) {
      console.error('Watchlist fetch error:', err);
      setError(err.message || 'Failed to load watchlists');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlists();
  };

  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }

    try {
      await apiClient.post('/watchlists', { name: newWatchlistName });
      setNewWatchlistName('');
      setShowModal(false);
      await fetchWatchlists();
      Alert.alert('Success', 'Watchlist created');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  const deleteWatchlist = async (id) => {
    try {
      await apiClient.delete(`/watchlists/${id}`);
      await fetchWatchlists();
      Alert.alert('Success', 'Watchlist deleted');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Watchlists</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchWatchlists}>
            <Text style={styles.retryButton}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {watchlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No watchlists yet</Text>
          <Text style={styles.emptySubtext}>Create one to get started</Text>
        </View>
      ) : (
        <FlatList
          data={watchlists}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.watchlistCard}>
              <View style={styles.watchlistInfo}>
                <Text style={styles.watchlistName}>{item.name}</Text>
                <Text style={styles.watchlistCount}>
                  {item.watchlist_items?.length || 0} stocks
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Delete', 'Remove this watchlist?', [
                    { text: 'Cancel' },
                    {
                      text: 'Delete',
                      onPress: () => deleteWatchlist(item.id),
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
            <Text style={styles.modalTitle}>Create Watchlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Watchlist name (e.g., Tech Stocks)"
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              placeholderTextColor="#ccc"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={createWatchlist}>
                <Text style={styles.createButtonText}>Create</Text>
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
  watchlistCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  watchlistCount: {
    fontSize: 12,
    color: '#999',
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
    marginBottom: 16,
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
