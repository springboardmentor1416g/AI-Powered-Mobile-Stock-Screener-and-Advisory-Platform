import React from 'react';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import colors from '../theme/colors';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function StockCard({ stock, onPress }) {
  const changeColor = stock.changePct >= 0 ? colors.success : colors.danger;

  return (
    <Card onPress={() => onPress?.(stock)} style={{ marginBottom: 10, backgroundColor: colors.card }}>
      <Card.Title title={stock.name} subtitle={stock.symbol} />
      <Card.Content>
        <Title>{formatCurrency(stock.price)}</Title>
        <Paragraph style={{ color: changeColor }}>
          {formatPercent(stock.changePct)} today
        </Paragraph>
        <Paragraph>Sector: {stock.sector} • P/E: {stock.pe}</Paragraph>
        <Chip style={{ marginTop: 6 }} icon="domain">
          Market Cap: ₹{stock.marketCap.toLocaleString('en-IN')}
        </Chip>
      </Card.Content>
    </Card>
  );
}