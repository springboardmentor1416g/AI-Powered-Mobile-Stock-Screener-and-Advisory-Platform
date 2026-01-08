import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { runScreener } from "../../services/api/screener";

export default function ScreenerQueryScreen({ navigation }) {
  const [queryText, setQueryText] = useState("Find IT stocks with PE < 25");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    try {
      setLoading(true);
      const data = await runScreener({ queryText, limit: 20 });

      if (!data?.success) {
        Alert.alert("Error", "Failed to run screener");
        return;
      }

      navigation.navigate("Results", {
        queryText,
        results: data.results || [],
        note: data.note,
      });
    } catch (e) {
      Alert.alert("Error", e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Screener</Text>
      <Text style={styles.subtitle}>
        Type your screener query (LLM + backend integration pending).
      </Text>

      <TextInput
        value={queryText}
        onChangeText={setQueryText}
        placeholder='e.g., "Find IT stocks with PE < 25"'
        style={styles.input}
        multiline
      />

      <Pressable style={styles.button} onPress={onRun} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Running..." : "Run Screener"}</Text>
      </Pressable>

      <Text style={styles.hint}>
        Next: query → LLM parser → DSL → screener engine → results.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 12 },
  title: { fontSize: 26, fontWeight: "700", marginTop: 12 },
  subtitle: { fontSize: 14, opacity: 0.75 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
  hint: { fontSize: 12, opacity: 0.7, marginTop: 6 },
});
