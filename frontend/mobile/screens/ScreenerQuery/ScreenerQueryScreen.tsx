import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { runNlScreener } from "../../services/api/nlScreener";

export default function ScreenerQueryScreen({navigation }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    try {
      setLoading(true);
      const data = await runNlScreener(query);

      navigation.navigate("Results", {
        status: data.count === 0 ? "empty" : "success",
        results: data.results,
      });
    } catch (err) {
      navigation.navigate("Results", {
        status: "error",
        results: [],
        error: "Invalid or unsupported query",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text>Enter screening query</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="e.g. PE < 5"
        style={{
          borderWidth: 1,
          padding: 12,
          marginVertical: 12,
        }}
      />

      <Button
        title={loading ? "Running..." : "Run Screener"}
        onPress={onRun}
        disabled={loading}
      />
    </View>
  );
}
