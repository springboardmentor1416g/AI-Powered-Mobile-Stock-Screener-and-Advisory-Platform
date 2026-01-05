import React from 'react';
import { ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import FilterBar from '../components/FilterBar';
import StockCard from '../components/StockCard';
import useStocks from '../hooks/useStocks';
import colors from '../theme/colors';

export default function ScreenerScreen({ navigation }) {
  const { stocks, filters, setFilters, loading } = useStocks({});

  return (
    <ScrollView style={{ padding: 16, backgroundColor: colors.bg }}>
      <FilterBar
        initial={filters}
        onApply={(f) => setFilters(f)}
      />
      {loading ? <ActivityIndicator /> : null}
      {stocks.map((s) => (
        <StockCard
          key={s.symbol}
          stock={s}
          onPress={(stock) => navigation.navigate('StockDetail', { symbol: stock.symbol })}
        />
      ))}
    </ScrollView>
  );
}