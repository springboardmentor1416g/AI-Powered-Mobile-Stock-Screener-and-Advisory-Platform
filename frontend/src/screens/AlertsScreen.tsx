import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getAlerts } from "../services/alerts.api";

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getAlerts().then(setAlerts);
  }, []);

  return (
    <FlatList
      data={alerts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.stock_id}</Text>
          <Text>{JSON.stringify(item.condition)}</Text>
        </View>
      )}
    />
  );
}
