import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function ScreenerQueryScreen({ navigation }) {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Screener</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter screening criteria..."
        value={query}
        onChangeText={setQuery}
      />

      <Text style={styles.note}>
        Backend & LLM integration pending
      </Text>

      <Button
        title="Run Screener"
        onPress={() => navigation.navigate('Results')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10
  },
  note: { color: 'gray', marginBottom: 20 }
});
