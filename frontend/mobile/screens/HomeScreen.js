import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/colors';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={COLORS.gradientPrimary}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>📊</Text>
            <Text style={styles.title}>Stock Screener</Text>
            <Text style={styles.subtitle}>Smart Investment Analysis</Text>
          </View>
          
          <View style={styles.featureContainer}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureTitle}>Precision Filtering</Text>
              <Text style={styles.featureText}>Filter stocks with custom criteria</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureTitle}>Real-time Data</Text>
              <Text style={styles.featureText}>Get latest market insights</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("ScreenerQuery")}
          >
            <LinearGradient
              colors={COLORS.gradientSuccess}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Screening</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.footer}>Discover your next investment</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 40,
    color: COLORS.textWhite,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryLight,
    textAlign: "center",
    opacity: 0.9,
  },
  featureContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textWhite,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  featureText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryLight,
    textAlign: 'center',
    opacity: 0.8,
  },
  button: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
    width: '100%',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textWhite,
    marginRight: SPACING.sm,
  },
  buttonArrow: {
    fontSize: 20,
    color: COLORS.textWhite,
  },
  footer: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primaryLight,
    opacity: 0.7,
  },
});
