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
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import apiClient from '../../services/apiClient';

const ALERT_TYPES = ['price', 'fundamental', 'event'];
const OPERATORS = ['<', '<=', '>', '>=', '=', '!='];
const FREQUENCIES = ['realtime', 'hourly', 'daily'];
const FIELDS = ['close', 'PE', 'EPS', 'revenue', 'marketCap'];

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    alertType: 'price',
    field: 'close',
    operator: '<',
    value: '',
    evaluationFrequency: 'daily',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setError(null);
      const response = await apiClient.get('/alerts');
      console.log('Alerts response:', response.data);
      const alertsData = response.data.data || response.data || [];
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
    } catch (err) {
      console.error('Alerts fetch error:', err);
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
  };

  const createAlert = async () => {
    if (!formData.ticker.trim() || !formData.value) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const alertRule = {
        field: formData.field,
        operator: formData.operator,
        value: parseFloat(formData.value),
      };

      await apiClient.post('/alerts', {
        ticker: formData.ticker.toUpperCase(),
        alertRule,
        alertType: formData.alertType,
        evaluationFrequency: formData.evaluationFrequency,
      });

      setFormData({
        ticker: '',
        alertType: 'price',
        field: 'close',
        operator: '<',
        value: '',
        evaluationFrequency: 'daily',
      });
      setShowModal(false);
      await fetchAlerts();
      Alert.alert('Success', 'Alert created');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  const toggleAlert = async (id, currentStatus) => {
    try {
      await apiClient.patch(`/alerts/${id}/toggle`, {
        active: !currentStatus,
      });
      await fetchAlerts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  const deleteAlert = async (id) => {
    try {
      await apiClient.delete(`/alerts/${id}`);
      await fetchAlerts();
      Alert.alert('Success', 'Alert deleted');
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
        <Text style={styles.title}>Price Alerts</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchAlerts}>
            <Text style={styles.retryButton}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No alerts yet</Text>
          <Text style={styles.emptySubtext}>Create one to track price changes</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.alertCard}>
              <View style={styles.alertInfo}>
                <View style={styles.alertHeader}>
                  <Text style={styles.ticker}>{item.ticker}</Text>
                  <TouchableOpacity
                    onPress={() => toggleAlert(item.id, item.active)}
                  >
                    <Text style={styles.statusBadge}>
                      {item.active ? '✓ ACTIVE' : '○ PAUSED'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.alertRule}>
                  {item.alert_rule?.field || 'Price'} {item.alert_rule?.operator} {item.alert_rule?.value}
                </Text>
                <Text style={styles.alertFrequency}>
                  {item.evaluation_frequency || 'daily'} • {item.alert_type || 'price'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Delete', 'Remove this alert?', [
                    { text: 'Cancel' },
                    {
                      text: 'Delete',
                      onPress: () => deleteAlert(item.id),
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
            <Text style={styles.modalTitle}>Create Alert</Text>

            <Text style={styles.label}>Ticker</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., AAPL"
              value={formData.ticker}
              onChangeText={(text) =>
                setFormData({ ...formData, ticker: text })
              }
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Alert Type</Text>
            <Picker
              selectedValue={formData.alertType}
              style={styles.picker}
              onValueChange={(value) =>
                setFormData({ ...formData, alertType: value })
              }
            >
              {ALERT_TYPES.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>

            <Text style={styles.label}>Field</Text>
            <Picker
              selectedValue={formData.field}
              style={styles.picker}
              onValueChange={(value) =>
                setFormData({ ...formData, field: value })
              }
            >
              {FIELDS.map((field) => (
                <Picker.Item key={field} label={field} value={field} />
              ))}
            </Picker>

            <View style={styles.conditionRow}>
              <View style={styles.operatorContainer}>
                <Text style={styles.label}>Operator</Text>
                <Picker
                  selectedValue={formData.operator}
                  style={styles.picker}
                  onValueChange={(value) =>
                    setFormData({ ...formData, operator: value })
                  }
                >
                  {OPERATORS.map((op) => (
                    <Picker.Item key={op} label={op} value={op} />
                  ))}
                </Picker>
              </View>

              <View style={styles.valueContainer}>
                <Text style={styles.label}>Value</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 150"
                  value={formData.value}
                  onChangeText={(text) =>
                    setFormData({ ...formData, value: text })
                  }
                  keyboardType="decimal-pad"
                  placeholderTextColor="#ccc"
                />
              </View>
            </View>

            <Text style={styles.label}>Frequency</Text>
            <Picker
              selectedValue={formData.evaluationFrequency}
              style={styles.picker}
              onValueChange={(value) =>
                setFormData({ ...formData, evaluationFrequency: value })
              }
            >
              {FREQUENCIES.map((freq) => (
                <Picker.Item key={freq} label={freq} value={freq} />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={createAlert}>
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
  alertCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f8ff',
    borderRadius: 4,
  },
  alertRule: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertFrequency: {
    fontSize: 12,
    color: '#999',
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    height: 40,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  operatorContainer: {
    flex: 1,
  },
  valueContainer: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
