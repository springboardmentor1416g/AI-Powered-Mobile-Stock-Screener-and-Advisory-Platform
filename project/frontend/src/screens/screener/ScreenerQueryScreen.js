import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { API_V1 } from "../../config/api";

export default function ScreenerQueryScreen({ navigation }) {
  const [query, setQuery] = useState("pe_ratio < 30");
  const [limit, setLimit] = useState("50");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setError("");
    if (!query.trim()) {
      setError("Please enter a query");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_V1}/screener/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: Number(limit || 50) }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      navigation.navigate("Results", { data });
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const presetQueries = [
    { label: "Low P/E Ratio", query: "pe_ratio < 30" },
    { label: "Tech Stocks (Low P/E)", query: "sector = IT and pe_ratio < 25" },
    { label: "Oversold (RSI)", query: "rsi < 40" },
    { label: "High Dividend Yield", query: "dividend_yield > 3" },
    { label: "Small Caps", query: "market_cap < 5000000000" },
    { label: "Moving Average Crossover", query: "price > sma_50" },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.headerIcon}>
              <Text style={styles.iconText}>🔍</Text>
            </View>
            <Text style={styles.title}>Stock Screener</Text>
            <Text style={styles.subtitle}>Find stocks matching your criteria</Text>
          </View>

          {/* Query Section */}
          <View style={styles.querySection}>
            <View style={styles.card}>
              <Text style={styles.label}>Search Query</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.queryIcon}>📝</Text>
                <TextInput
                  style={styles.input}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="pe_ratio < 30 and sector = IT"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  editable={!loading}
                />
              </View>
              <Text style={styles.hint}>Example: pe_ratio &lt; 30, rsi &lt; 40, sector = IT</Text>
            </View>

            {/* Limit Control */}
            <View style={styles.card}>
              <Text style={styles.label}>Results Limit</Text>
              <View style={styles.limitContainer}>
                <View style={styles.limitInput}>
                  <Text style={styles.limitIcon}>📊</Text>
                  <TextInput
                    style={styles.input}
                    value={limit}
                    onChangeText={setLimit}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>
                <Text style={styles.limitHint}>stocks</Text>
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Run Button */}
            <TouchableOpacity
              style={[styles.runButton, loading && styles.buttonDisabled]}
              onPress={run}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.runButtonText}>Screening...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.runButtonIcon}>⚡</Text>
                  <Text style={styles.runButtonText}>Run Screener</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Preset Queries */}
          <View style={styles.presetsSection}>
            <Text style={styles.presetsTitle}>Quick Filters</Text>
            <View style={styles.presetsGrid}>
              {presetQueries.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetButton}
                  onPress={() => {
                    setQuery(preset.query);
                    setError("");
                  }}
                  disabled={loading}
                >
                  <Text style={styles.presetButtonText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  querySection: {
    marginBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  queryIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
    paddingVertical: 8,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontWeight: "500",
  },
  limitContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  limitInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  limitIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  limitHint: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  errorBox: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#991b1b",
    fontWeight: "600",
  },
  runButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  runButtonIcon: {
    fontSize: 18,
  },
  runButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
  presetsSection: {
    marginBottom: 20,
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#3b82f6",
    marginBottom: 8,
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6",
  },
});
