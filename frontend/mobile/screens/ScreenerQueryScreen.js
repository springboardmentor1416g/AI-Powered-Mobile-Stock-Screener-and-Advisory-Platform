import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";

export default function ScreenerQueryScreen({ navigation }) {
  const [query, setQuery] = useState("");

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Screener Query
      </Text>

      <TextInput
        placeholder="e.g. PE < 5 and promoter holding > 50"
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20
        }}
      />

      <Text style={{ marginBottom: 20 }}>
        Backend & LLM integration pending
      </Text>

      <Button
        title="Run Screener"
        onPress={() => navigation.navigate("Results")}
      />
    </View>
  );
}
