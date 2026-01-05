import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { ActivityIndicator, Card, Title, Paragraph } from 'react-native-paper';
import { fetchStockDetail } from '../services/api';
import { getAdvisoryFor } from '../services/ai';
import colors from '../theme/colors';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function StockDetailScreen({ route }) {
  const { symbol } = route.params;
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await fetchStockDetail(symbol);
        setStock(s);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [symbol]);

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;
  if (!stock) return <Paragraph style={{ margin: 16 }}>Stock not found.</Paragraph>;

  const advisory = getAdvisoryFor(stock);

  return (
    <ScrollView style={{ padding: 16, backgroundColor: colors.bg }}>
      <Card style={{ backgroundColor: colors.card }}>
        <Card.Title title={`${stock.name} (${stock.symbol})`} />
        <Card.Content>
          <Title>{formatCurrency(stock.price)} • {formatPercent(stock.changePct)}</Title>
          <Paragraph>Sector: {stock.sector}</Paragraph>
          <Paragraph>P/E: {stock.pe}</Paragraph>
          <Paragraph>Market Cap: ₹{stock.marketCap.toLocaleString('en-IN')}</Paragraph>
          <Paragraph style={{ marginTop: 12 }}>Advisory: {advisory.rating} — {advisory.rationale}</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}