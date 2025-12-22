import React from "react";
import { View, Text, Button } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        AI Stock Screener
      </Text>

      <Button
        title="Go to Screener"
        onPress={() => navigation.navigate("ScreenerQuery")}
      />
    </View>
  );
}
