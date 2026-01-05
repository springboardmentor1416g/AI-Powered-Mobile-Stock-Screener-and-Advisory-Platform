import React from 'react';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import colors from '../theme/colors';
import { trimText } from '../utils/formatters';

export default function AdvisoryCard({ stock, advisory }) {
  const tone = advisory.rating === 'Buy' ? colors.success
    : advisory.rating === 'Hold' ? colors.warning : colors.muted;

  return (
    <Card style={{ marginBottom: 10, backgroundColor: colors.card }}>
      <Card.Title title={`${stock.name} (${stock.symbol})`} />
      <Card.Content>
        <Title style={{ color: tone }}>{advisory.rating}</Title>
        <Paragraph>{trimText(advisory.rationale, 200)}</Paragraph>
        <Chip style={{ marginTop: 6 }} icon="chart-line">Sector: {stock.sector}</Chip>
      </Card.Content>
    </Card>
  );
}