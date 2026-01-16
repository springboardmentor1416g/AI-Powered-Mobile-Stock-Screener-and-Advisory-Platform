import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import notificationService from '../../services/notification.service';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({ unread: 0, read: 0, dismissed: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('unread');

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({
        status: filter === 'all' ? null : filter
      });
      setNotifications(data);

      // Load counts
      const countsData = await notificationService.getNotificationCounts();
      setCounts(countsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notifications');
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [filter]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as read');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  // Handle delete
  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.status === 'unread' && styles.notificationItemUnread
      ]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={item.alert_type === 'price' ? 'trending-down' : 'bar-chart'}
          size={24}
          color={item.status === 'unread' ? '#2563EB' : '#999'}
        />
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTicker}>{item.ticker}</Text>
          <Text style={styles.notificationTime}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="close" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && notifications.length === 0) {
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
        <Text style={styles.headerTitle}>Notifications</Text>
        {counts.unread > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllButtonText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Unread</Text>
          <Text style={styles.statValue}>{counts.unread}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Read</Text>
          <Text style={styles.statValue}>{counts.read}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Dismissed</Text>
          <Text style={styles.statValue}>{counts.dismissed}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['unread', 'read', 'all'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterTab,
              filter === type && styles.filterTabActive
            ]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === type && styles.filterTabTextActive
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#999" />
            <Text style={styles.emptyStateText}>No notifications</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllButtonText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  filterTabTextActive: {
    color: '#2563EB',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
    alignItems: 'flex-start',
  },
  notificationItemUnread: {
    backgroundColor: '#EFF6FF',
    borderLeftColor: '#2563EB',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  notificationTicker: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default NotificationsScreen;
