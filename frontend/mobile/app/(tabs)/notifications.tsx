import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { getNotifications } from "../../src/services/api";

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No notifications yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 14,
            marginBottom: 12,
            borderRadius: 8,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Text style={{ fontSize: 16 }}>{item.message}</Text>
          <Text style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
}
