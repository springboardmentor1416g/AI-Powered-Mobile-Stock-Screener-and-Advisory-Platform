import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <Text style={styles.title}>AI Stock Screener</Text>
        <Text style={styles.subtitle}>Intelligent market analysis</Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { width: "100%", padding: 30, alignItems: "center" },
  title: { fontSize: 36, fontWeight: "bold", color: "white", marginBottom: 10 },
  subtitle: { fontSize: 18, color: "#94a3b8", marginBottom: 40 },
  button: { width: "100%", height: 56, backgroundColor: "#3b82f6", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "white" },
});