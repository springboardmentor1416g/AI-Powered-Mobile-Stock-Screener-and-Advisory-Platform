import { View, Text, FlatList } from 'react-native';

const MOCK_RESULTS = [
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'INFY', name: 'Infosys Ltd' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' }
];

export default function ResultsScreen({ route }) {
  const { query } = route.params || {};

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Results for:
      </Text>
      <Text style={{ fontStyle: 'italic', marginBottom: 20 }}>
        {query || 'Sample Query'}
      </Text>

      <FlatList
        data={MOCK_RESULTS}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.symbol}</Text>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}
