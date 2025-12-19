import React from 'react';
import { View, Text, FlatList } from 'react-native';

export default function ResultsScreen({ route }) {
  const { results = [] } = route.params || {};

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>
        Screener Results
      </Text>

      {results.length === 0 ? (
        <Text>No results found</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderColor: '#ddd',
              }}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                {item.symbol}
              </Text>

              <Text>{item.name}</Text>

              <Text>
                PE: {item.pe_ratio !== undefined ? item.pe_ratio : 'N/A'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
