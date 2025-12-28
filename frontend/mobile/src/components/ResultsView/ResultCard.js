import React from 'react';
import { View, Text } from 'react-native';

export default function ResultCard({ stock }) {
  return (
    <View
      style={{
        padding: 14,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        {stock.symbol}
      </Text>

      <Text style={{ color: '#555' }}>
        {stock.name}
      </Text>

      {stock.pe_ratio !== undefined && (
        <Text>PE: {stock.pe_ratio}</Text>
      )}

      {stock.revenue_growth !== undefined && (
        <Text>Revenue Growth: {stock.revenue_growth}%</Text>
      )}
    </View>
  );
}
