import React, { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { runScreener } from "../services/api/screener";

export default function ScreenerQuery({ navigation }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunScreener = async () => {
    if (!query.trim()) {
      setError("Please enter a screener query");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await runScreener(query);
      navigation.navigate("Results", { results });
    } catch (err) {
      setError("Failed to fetch screener results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Stock Screener
      </Text>

      <TextInput
        placeholder="Example: price > 100 AND volume > 1M"
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
      />

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Run Screener" onPress={handleRunScreener} />
      )}
    </View>
  );
}
