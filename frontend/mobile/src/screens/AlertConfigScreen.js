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
  RefreshControl,
  Switch,
  Picker
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import alertService from '../../services/alerts.service';

const AlertConfigScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    ticker: '',
    alertType: 'price',
    name: '',
    evaluationFrequency: 'daily',
    condition: {
      field: 'close',
      operator: '<',
      value: ''
    }
  });

  // Load alerts
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await alertService.getUserAlerts();
      setAlerts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load alerts');
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAlerts();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }, []);

  // Create alert
  const handleCreateAlert = async () => {
    if (!formData.ticker.trim()) {
      Alert.alert('Error', 'Please enter a stock ticker');
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter an alert name');
      return;
    }

    if (!formData.condition.value) {
      Alert.alert('Error', 'Please enter a threshold value');
      return;
    }

    try {
      setLoading(true);
      const alertRule = {
        field: formData.condition.field,
        operator: formData.condition.operator,
        value: parseFloat(formData.condition.value)
      };

      await alertService.createAlert(
        formData.ticker.toUpperCase(),
        alertRule,
        {
          name: formData.name,
          alertType: formData.alertType,
          evaluationFrequency: formData.evaluationFrequency
        }
      );

      setFormData({
        ticker: '',
        alertType: 'price',
        name: '',
        evaluationFrequency: 'daily',
        condition: { field: 'close', operator: '<', value: '' }
      });
      setShowCreateModal(false);
      await loadAlerts();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  // Toggle alert
  const handleToggleAlert = async (alertId, currentStatus) => {
    try {
      const newActive = currentStatus !== 'active';
      await alertService.toggleAlert(alertId, newActive);
      await loadAlerts();
    } catch (error) {
      Alert.alert('Error', 'Failed to update alert');
    }
  };

  // Delete alert
  const handleDeleteAlert = async (alertId) => {
    Alert.alert(
      'Confirm',
      'Delete this alert?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await alertService.deleteAlert(alertId);
              await loadAlerts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete alert');
            }
          }
        }
      ]
    );
  };

  const renderAlertItem = ({ item }) => {
    const rule = typeof item.alert_rule === 'string' ? JSON.parse(item.alert_rule) : item.alert_rule;
    const isActive = item.status === 'active';

    return (
      <View style={styles.alertItem}>
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertName}>{item.name}</Text>
            <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.alertDetails}>
            <Text style={styles.alertTicker}>{item.ticker}</Text>
            <Text style={styles.alertCondition}>
              {rule.field} {rule.operator} {rule.value}
            </Text>
            <Text style={styles.alertFrequency}>
              Eval: {item.evaluation_frequency}
            </Text>
          </View>
        </View>

        <View style={styles.alertActions}>
          <Switch
            value={isActive}
            onValueChange={() => handleToggleAlert(item.id, item.status)}
            trackColor={{ false: '#ccc', true: '#81C784' }}
            thumbColor={isActive ? '#4CAF50' : '#f4f3f4'}
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAlert(item.id)}
          >
            <Ionicons name="trash" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && alerts.length === 0) {
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
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add-circle" size={28} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Alerts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={48} color="#999" />
              <Text style={styles.emptyStateText}>No alerts configured</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createButtonText}>Create Your First Alert</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={alerts}
              renderItem={renderAlertItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Alert Types Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Alert Types</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoType}>📈 Price Alerts</Text>
            <Text style={styles.infoDesc}>Get notified when stock price reaches a threshold</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoType}>📊 Fundamental Alerts</Text>
            <Text style={styles.infoDesc}>Monitor PE ratio, earnings growth, and other metrics</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoType}>📅 Event Alerts</Text>
            <Text style={styles.infoDesc}>Track earnings dates and buyback announcements</Text>
          </View>
        </View>
      </ScrollView>

      {/* Create Alert Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Alert</Text>

            {/* Ticker Input */}
            <Text style={styles.fieldLabel}>Stock Ticker *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., AAPL"
              value={formData.ticker}
              onChangeText={(text) =>
                setFormData({ ...formData, ticker: text.toUpperCase() })
              }
              placeholderTextColor="#999"
            />

            {/* Alert Name */}
            <Text style={styles.fieldLabel}>Alert Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., AAPL Price Drop Alert"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholderTextColor="#999"
            />

            {/* Alert Type */}
            <Text style={styles.fieldLabel}>Alert Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.alertType}
                onValueChange={(value) =>
                  setFormData({ ...formData, alertType: value })
                }
              >
                <Picker.Item label="Price" value="price" />
                <Picker.Item label="Fundamental" value="fundamental" />
                <Picker.Item label="Event" value="event" />
              </Picker>
            </View>

            {/* Evaluation Frequency */}
            <Text style={styles.fieldLabel}>Check Frequency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.evaluationFrequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, evaluationFrequency: value })
                }
              >
                <Picker.Item label="Real-time" value="realtime" />
                <Picker.Item label="Hourly" value="hourly" />
                <Picker.Item label="Daily" value="daily" />
              </Picker>
            </View>

            {/* Condition Builder */}
            <Text style={styles.fieldLabel}>Alert Condition</Text>

            {/* Field Selector */}
            <Text style={styles.conditionLabel}>Field</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.condition.field}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    condition: { ...formData.condition, field: value }
                  })
                }
              >
                <Picker.Item label="Stock Price (Close)" value="close" />
                <Picker.Item label="PE Ratio" value="pe_ratio" />
                <Picker.Item label="EPS" value="eps" />
                <Picker.Item label="Revenue" value="revenue" />
              </Picker>
            </View>

            {/* Operator Selector */}
            <Text style={styles.conditionLabel}>Condition</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.condition.operator}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    condition: { ...formData.condition, operator: value }
                  })
                }
              >
                <Picker.Item label="Less than (<)" value="<" />
                <Picker.Item label="Less or equal (≤)" value="<=" />
                <Picker.Item label="Greater than (>)" value=">" />
                <Picker.Item label="Greater or equal (≥)" value=">=" />
                <Picker.Item label="Equals (=)" value="=" />
              </Picker>
            </View>

            {/* Threshold Value */}
            <Text style={styles.conditionLabel}>Value *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150"
              value={formData.condition.value}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  condition: { ...formData.condition, value: text }
                })
              }
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setFormData({
                    ticker: '',
                    alertType: 'price',
                    name: '',
                    evaluationFrequency: 'daily',
                    condition: { field: 'close', operator: '<', value: '' }
                  });
                  setShowCreateModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateAlert}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>Create Alert</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
    color: '#374151',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: '#DBEAFE',
  },
  inactiveBadge: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  alertDetails: {
    marginTop: 4,
  },
  alertTicker: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  alertCondition: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
  },
  alertFrequency: {
    fontSize: 10,
    color: '#999',
    marginTop: 1,
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 6,
  },
  infoSection: {
    marginHorizontal: 12,
    marginVertical: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  infoDesc: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
    marginTop: 12,
  },
  conditionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 14,
    color: '#111',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
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

export default AlertConfigScreen;
