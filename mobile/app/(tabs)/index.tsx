import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={["#0f172a", "#1e293b"]} // Slate 900 to Slate 800
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          
          {/* Hero Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]} // Blue gradient for icon bg
              style={styles.iconBackground}
            >
              <MaterialCommunityIcons name="finance" size={48} color="white" />
            </LinearGradient>
          </View>

          {/* Text Content */}
          <View style={styles.textWrapper}>
            <Text style={styles.title}>Stock Screener</Text>
            <Text style={styles.subtitle}>
              Analyze the market with real-time data with NLP.
            </Text>
          </View>

          {/* Custom Action Button */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.push("/screener")}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]} // Emerald Green Gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 30, // Squircle shape
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "-10deg" }], // Slight tilt for dynamic feel
  },
  textWrapper: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8", // Slate 400
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});