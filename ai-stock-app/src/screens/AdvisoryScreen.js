import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { fetchStocks } from '../services/api';
import { getAdvisoryFor } from '../services/ai';
import AdvisoryCard from '../components/AdvisoryCard';
import colors from '../theme/colors';

export default function AdvisoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const stocks = await fetchStocks();
        setItems(stocks.map(s => ({ stock: s, advisory: getAdvisoryFor(s) })));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ScrollView style={{ padding: 16, backgroundColor: colors.bg }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Today’s Advisory</Text>
      {loading ? <ActivityIndicator /> : null}
      {items.map(({ stock, advisory }) => (
        <AdvisoryCard key={stock.symbol} stock={stock} advisory={advisory} />
      ))}
    </ScrollView>
  );
}