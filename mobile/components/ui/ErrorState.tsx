import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface ErrorProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState = ({ message = "Something went wrong", onRetry }: ErrorProps) => (
  <View style={styles.center}>
    <Text style={styles.title}>Error</Text>
    <Text style={styles.message}>{message}</Text>
    {/* "Provide retry option on failure screens" - Jan 12 Doc [cite: 26] */}
    <Button title="Try Again" onPress={onRetry} />
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  message: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }
});