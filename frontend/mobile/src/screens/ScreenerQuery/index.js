import React, { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet } from "react-native";
import { runScreener } from "../../services/api/screener";

export default function ScreenerQuery({ navigation }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    if (!query.trim()) {
      setError("Please enter a screener query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await runScreener(query);
      navigation.navigate("Results", { data: response });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Screener</Text>

      <TextInput
        placeholder="e.g. large cap tech stocks with PE < 30"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      <Text style={styles.helper}>
        Supported format: simple English (LLM coming later)
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Run Screener" onPress={handleRun} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  helper: { color: "#666", marginBottom: 10 },
  error: { color: "red", marginBottom: 10 },
});
