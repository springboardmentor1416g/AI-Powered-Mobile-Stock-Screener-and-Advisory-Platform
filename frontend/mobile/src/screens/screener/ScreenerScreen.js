import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function ScreenerScreen({ navigation }) {
  const handleOpenScreener = () => {
    navigation.navigate('ScreenerQuery');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stock Screener</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Run Screener</Text>
          <Text style={styles.cardSubtitle}>Apply filters and find stocks</Text>
          <TouchableOpacity style={styles.button} onPress={handleOpenScreener}>
            <Text style={styles.buttonText}>Open Screener</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved Queries</Text>
          <Text style={styles.cardSubtitle}>No saved queries yet</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Results</Text>
          <Text style={styles.cardSubtitle}>No recent results</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
