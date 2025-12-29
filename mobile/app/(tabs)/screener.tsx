import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Fixes Warning
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// 🔧 CONFIGURATION
// Use 'localhost' if you ran: adb reverse tcp:4000 tcp:4000
// Otherwise use 'http://10.0.2.2:4000/api/llm/parse'
const API_URL = 'http://localhost:4000/api/llm/parse';

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
      console.log(`Sending query to: ${API_URL}`);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nlQuery }),
      });

      // 1. Parse response first
      const data = await res.json();

      // 2. Check if Backend reported a logic error (e.g. "Unknown field")
      if (!data.success) {
        Alert.alert("Query Failed", data.error || "The AI could not process your request.");
        return;
      }

      // 3. Success!
      router.push({
        pathname: "/results",
        params: { results: JSON.stringify(data.results) },
      });
      
    } catch (err: any) {
      console.error(err);
      // 4. Handle Network Errors separately
      if (err.message && err.message.includes("Network request failed")) {
        Alert.alert("Connection Error", "Cannot reach server. Run 'adb reverse tcp:4000 tcp:4000' in terminal.");
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.background} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Stock Screener</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Ask in Plain English</Text>
          <Text style={styles.sectionSubtitle}>
            Example: "Show me Technology companies with stock price above 100"
          </Text>

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

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            onPress={runScreener}
            disabled={isLoading}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={isLoading ? ["#475569", "#334155"] : ["#3b82f6", "#2563eb"]}
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
  mainContainer: { flex: 1, backgroundColor: "#0f172a" },
  background: { position: "absolute", left: 0, right: 0, top: 0, height: "100%" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "white" },
  backButton: { width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  contentContainer: { flex: 1, padding: 24 },
  sectionTitle: { fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 8 },
  sectionSubtitle: { fontSize: 16, color: "#94a3b8", marginBottom: 20 },
  queryBox: { backgroundColor: "#020617", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16, marginBottom: 30 },
  queryInput: { minHeight: 90, color: "white", fontSize: 16, lineHeight: 22, textAlignVertical: "top" },
  buttonWrapper: { marginBottom: 20 },
  button: { height: 58, borderRadius: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "white" },
});