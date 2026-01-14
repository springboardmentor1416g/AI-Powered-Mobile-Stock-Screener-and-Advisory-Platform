import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useRootNavigationState } from "expo-router"; // 👈 1. Import this hook
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../../context/AuthContext";

import { 
  Gesture, 
  GestureDetector, 
  GestureHandlerRootView,
  Directions 
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

// 🔧 CONFIG
const API_URL = 'http://localhost:4000/api/llm/parse';

export default function ScreenerScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState(); // 👈 2. Get navigation state
  const { user, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [nlQuery, setNlQuery] = useState("");

  // 🔒 SECURITY CHECK
  useEffect(() => {
    // 👈 3. Critical Fix: Check if navigation is ready
    if (!rootNavigationState?.key) return;

    if (!user) {
      router.replace("/(auth)/login");
    }
  }, [user, rootNavigationState?.key]); // 👈 4. Add key to dependencies

  // Handle Logout
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: () => {
          logout(); 
          router.replace("/(auth)/login");
        } 
      }
    ]);
  };

  // Navigate to Portfolio (Swipe Up Action)
  const navigateToPortfolio = () => {
    router.push("/portfolio");
  };

  const flingUp = Gesture.Fling()
    .direction(Directions.UP)
    .onEnd(() => {
      runOnJS(navigateToPortfolio)();
    });

  const runScreener = async () => {
    if (!nlQuery.trim()) {
      Alert.alert("Missing Query", "Please enter a query in plain English.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nlQuery }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Query Failed", data.error || "The AI could not process your request.");
        return;
      }

      router.push({
        pathname: "/results",
        params: { results: JSON.stringify(data.results) },
      });
      
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  // 👈 5. Optional: Return null if navigation isn't ready to prevent rendering UI glitches
  if (!rootNavigationState?.key) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={flingUp}>
        <View style={styles.mainContainer}>
          <StatusBar style="light" />
          <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.background} />

          <SafeAreaView style={styles.safeArea}>
            {/* HEADER */}
            <View style={styles.header}>
              <View style={{ width: 40 }} />
              <Text style={styles.headerTitle}>AI Stock Screener</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="power" size={24} color="#f87171" />
              </TouchableOpacity>
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

              <View style={styles.swipeHint}>
                <MaterialCommunityIcons name="chevron-up" size={24} color="#64748b" />
                <Text style={styles.swipeText}>Swipe Up for Portfolio</Text>
              </View>

            </View>
          </SafeAreaView>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#0f172a" },
  background: { position: "absolute", left: 0, right: 0, top: 0, height: "100%" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "white" },
  logoutButton: { width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  contentContainer: { flex: 1, padding: 24 },
  sectionTitle: { fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 8 },
  sectionSubtitle: { fontSize: 16, color: "#94a3b8", marginBottom: 20 },
  queryBox: { backgroundColor: "#020617", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16, marginBottom: 30 },
  queryInput: { minHeight: 90, color: "white", fontSize: 16, lineHeight: 22, textAlignVertical: "top" },
  buttonWrapper: { marginBottom: 10 },
  button: { height: 58, borderRadius: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "white" },
  swipeHint: { alignItems: "center", marginTop: 20, opacity: 0.7 },
  swipeText: { color: "#64748b", fontSize: 12, marginTop: -4 }
});