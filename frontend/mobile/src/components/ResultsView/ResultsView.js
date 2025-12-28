import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import ResultCard from './ResultCard';

export default function ResultsView({
  loading,
  error,
  results = [],
}) {
  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Running screener...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 16 }}>
          Unable to load results. Please try again.
        </Text>
      </View>
    );
  }

  if (!results.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 16 }}>
          No stocks matched your criteria.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.symbol}
      renderItem={({ item }) => <ResultCard stock={item} />}
    />
  );
}
