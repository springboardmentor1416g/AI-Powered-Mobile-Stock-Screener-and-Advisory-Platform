import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
// Note: You will need to install a library. 
// Example: npx expo install react-native-svg
// For this placeholder, we will simulate the chart container required by Jan 12th Doc.

interface ChartProps {
  data: { timestamp: number; value: number }[];
  range: string; // 1D, 1W, 1M, 1Y
}

export const StockChart = ({ data, range }: ChartProps) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>Chart data unavailable</Text>
      </View>
    );
  }

  // This is where you would drop in <LineChart> from your chosen library
  return (
    <View style={styles.container}>
      <View style={styles.graphArea}>
        {/* Placeholder for the visual line */}
        <Text style={styles.rangeText}>{range} Performance</Text>
        <View style={styles.mockLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 16, backgroundColor: '#fff', borderRadius: 8, padding: 10 },
  placeholderContainer: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8 },
  placeholderText: { color: '#888' },
  graphArea: { height: 200, justifyContent: 'center', alignItems: 'center' },
  rangeText: { position: 'absolute', top: 10, left: 10, fontSize: 12, color: '#888' },
  mockLine: { width: '90%', height: 2, backgroundColor: '#007AFF', transform: [{ rotate: '-10deg' }] }
});