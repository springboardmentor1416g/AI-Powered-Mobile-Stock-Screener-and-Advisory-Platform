import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const mockResults = [
  { id: '1', name: 'TCS', symbol: 'TCS', metric: 'ROE: 25%' },
  { id: '2', name: 'Infosys', symbol: 'INFY', metric: 'ROE: 30%' },
];

export default function ResultsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>

      <FlatList
        data={mockResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.name} ({item.symbol})</Text>
            <Text>{item.metric}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10
  }
});
