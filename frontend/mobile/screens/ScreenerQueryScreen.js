import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { runScreener } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/colors';

export default function ScreenerQueryScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();

  const handleRunScreener = async () => {
    if (!query.trim()) {
      setError('Please enter a screener query');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const results = await runScreener(query);
      setLoading(false);
      navigation.navigate('Results', { results, query, isLoading: false, error: null });
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
      navigation.navigate('Results', { 
        results: [], 
        query, 
        isLoading: false, 
        error: errorMessage 
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={theme.gradientBackground}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <LinearGradient
              colors={isDarkMode ? ['#1E3A8A15', '#1E3A8A25'] : ['#EFF6FF', '#DBEAFE']}
              style={styles.headerCard}
            >
              <View style={styles.headerContent}>
                <View style={[styles.iconBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.headerIcon}>📈</Text>
                </View>
                <View style={styles.headerText}>
                  <Text style={[styles.title, { color: theme.textPrimary }]}>Stock Screener</Text>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Stock analysis and screening tool for Investors
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Screening Query</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.textPrimary 
              }]}
              placeholder=""
              placeholderTextColor={theme.placeholder}
              value={query}
              onChangeText={setQuery}
              multiline
              numberOfLines={4}
            />

            {error ? (
              <View style={[styles.errorContainer, { 
                backgroundColor: theme.error + '15',
                borderLeftColor: theme.error 
              }]}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={styles.buttonWrapper}
              onPress={handleRunScreener} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? [theme.disabled, theme.disabled] : theme.gradientPrimary}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Run Screener</Text>
                    <Text style={styles.buttonIcon}>→</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
    gap: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '800',
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 18,
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  label: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorContainer: {
    borderLeftWidth: 3,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    flex: 1,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginTop: SPACING.xl,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  button: {
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
    marginRight: SPACING.sm,
    fontWeight: '700',
  },
  buttonIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});