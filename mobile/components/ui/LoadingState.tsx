import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export const LoadingState = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.text}>Fetching market data...</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 12, color: '#666', fontSize: 16 }
});