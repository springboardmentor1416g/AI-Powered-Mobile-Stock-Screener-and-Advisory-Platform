import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/colors';
import { StockCard, EmptyState, LoadingState, ErrorState } from '../components/ResultsView';

export default function ResultsScreen({ route, navigation }) {
  const { results = [], query, isLoading = false, error = null } = route.params || {};
  const { theme } = useTheme();

  const getHighlightedFields = () => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    const fields = [];
    
    if (lowerQuery.includes('pe') || lowerQuery.includes('p/e')) fields.push('pe_ratio');
    if (lowerQuery.includes('pb') || lowerQuery.includes('p/b')) fields.push('pb_ratio');
    if (lowerQuery.includes('roe')) fields.push('roe');
    if (lowerQuery.includes('roa')) fields.push('roa');
    if (lowerQuery.includes('market cap') || lowerQuery.includes('mcap')) fields.push('market_cap');
    if (lowerQuery.includes('revenue')) fields.push('revenue');
    if (lowerQuery.includes('eps')) fields.push('eps');
    if (lowerQuery.includes('margin')) fields.push('operating_margin');
    
    return fields;
  };

  const highlightedFields = getHighlightedFields();

  const handleRetry = () => {
    navigation.goBack();
  };

  const renderStockCard = ({ item }) => (
    <StockCard item={item} highlightedFields={highlightedFields} />
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingState />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorState 
          onRetry={handleRetry} 
          errorMessage={error}
          showDetails={false}
        />
      </View>
    );
  }

  // Empty state
  if (!results || results.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Screener Results
          </Text>
        </View>
        <EmptyState />
      </View>
    );
  }

  // Results state
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Screener Results
          </Text>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.surface }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={18} color={theme.primary} />
            <Text style={[styles.editButtonText, { color: theme.primary }]}>
              Edit Query
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.resultsCount}>
          <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
          <Text style={[styles.countText, { color: theme.textSecondary }]}>
            {results.length} {results.length === 1 ? 'stock' : 'stocks'} found
          </Text>
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => item.ticker || index.toString()}
        renderItem={renderStockCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    gap: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  editButtonText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  resultsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  countText: {
    ...TYPOGRAPHY.body,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
});
