import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { runScreener } from '../../services/api/screener';

export default function ScreenerQueryScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!query.trim()) {
      Alert.alert('Validation', 'Please enter a screener query');
      return;
    }

    setLoading(true);

    try {
      const response = await runScreener(query);

      console.log('Screener API response:', response);

      // 🔑 THIS IS CRITICAL
      if (!response || !response.results) {
        throw new Error('Invalid screener response');
      }

      navigation.navigate('Results', {
        results: response.results,
      });
    } catch (err) {
      console.error('Screener Error:', err);
      Alert.alert(
        'Screener Error',
        'Failed to run screener. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>
        Stock Screener
      </Text>

      <TextInput
        placeholder="Enter a screening query (example: PE < 20)"
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 16,
          borderRadius: 6,
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Run Screener" onPress={handleRun} />
      )}
    </View>
  );
}
