import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function ScreenerScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const runScreener = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const res = await fetch("http://192.168.211.1:4000/screener/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: "Total Revenue",
          operator: ">",
          value: 1000000000,
        }),
      });

      const data = await res.json();

      router.push({
        pathname: "/results",
        params: { results: JSON.stringify(data) },
      });
    } catch (err) {
      Alert.alert("Connection Failed", "Could not reach the market server.");
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Scan</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <Text style={styles.sectionSubtitle}>Review your search criteria below.</Text>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="finance" size={24} color="#38bdf8" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Metric</Text>
                <Text style={styles.cardValue}>Total Revenue</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
                <MaterialCommunityIcons name="greater-than" size={20} color="#10b981" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Operator</Text>
                <Text style={styles.cardValue}>Greater Than</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
                <MaterialCommunityIcons name="currency-usd" size={24} color="#f59e0b" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Threshold</Text>
                <Text style={styles.cardValue}>1,000,000,000</Text>
              </View>
            </View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.buttonText}>Run Scanner</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "white", padding: 25 },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: { flex: 1, padding: 24 },
  sectionTitle: { fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 8 },
  sectionSubtitle: { fontSize: 16, color: "#94a3b8", marginBottom: 30 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTextContainer: { flex: 1 },
  cardLabel: { fontSize: 14, color: "#94a3b8", marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: "600", color: "white" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginLeft: 64 },
  buttonWrapper: { marginBottom: 20 },
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
  buttonText: { fontSize: 18, fontWeight: "bold", color: "white" },
});