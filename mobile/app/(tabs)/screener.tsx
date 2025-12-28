import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Platform, // Import Platform
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// ----------------------------------------------------------------------
// 🔧 CONFIGURATION
// ----------------------------------------------------------------------
// Android Emulator uses 10.0.2.2. iOS Simulator uses localhost.
// Real Device? Use your PC's local IP (e.g., 192.168.1.5)
const API_URL = 'http://192.168.137.1:4000/api/llm/parse'

export default function ScreenerScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [nlQuery, setNlQuery] = useState("");

  const runScreener = async () => {
    if (!nlQuery.trim()) {
      Alert.alert("Missing Query", "Please enter a query in plain English.");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Sending query to: ${API_URL}`); // Debug log

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: nlQuery,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to process query");
      }

      // Navigate to results page with the fetched data
      // Note: Make sure your /results page can handle `data.results` (the array of stocks)
      router.push({
        pathname: "/results",
        params: { results: JSON.stringify(data.results) },
      });
      
    } catch (err) {
      Alert.alert("Error", "Could not process your query. Check backend connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Stock Screener</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.contentContainer}>
          {/* Section Title */}
          <Text style={styles.sectionTitle}>Ask in Plain English</Text>
          <Text style={styles.sectionSubtitle}>
            Example: "Show companies with revenue above 1 billion and profit growth over 10%"
          </Text>

          {/* Natural Language Query Input */}
          <View style={styles.queryBox}>
            <TextInput
              style={styles.queryInput}
              placeholder="Type your stock screening query here..."
              placeholderTextColor="#94a3b8"
              multiline
              value={nlQuery}
              onChangeText={setNlQuery}
            />
          </View>

          {/* Info Card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="robot-outline" size={24} color="#38bdf8" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>AI Processing</Text>
                <Text style={styles.cardValue}>English → SQL → PostgreSQL</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
                <MaterialCommunityIcons name="database-search" size={24} color="#10b981" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Data Source</Text>
                <Text style={styles.cardValue}>PostgreSQL Market Data</Text>
              </View>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          {/* Run Button */}
          <TouchableOpacity
            onPress={runScreener}
            disabled={isLoading}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={
                isLoading
                  ? ["#475569", "#334155"]
                  : ["#3b82f6", "#2563eb"]
              }
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={styles.buttonText}>Run AI Screener</Text>
                  <MaterialCommunityIcons name="radar" size={20} color="white" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 20,
  },
  queryBox: {
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    marginBottom: 30,
  },
  queryInput: {
    minHeight: 90,
    color: "white",
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 64,
  },
  buttonWrapper: {
    marginBottom: 20,
  },
  button: {
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});