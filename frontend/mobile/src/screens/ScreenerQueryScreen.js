import { View, Text, TextInput, Button } from 'react-native';
import { useState } from 'react';

export default function ScreenerQueryScreen({ navigation }) {
  const [query, setQuery] = useState('');

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Enter Screener Query
      </Text>

      <TextInput
        placeholder="e.g. PE < 20 AND revenue growth > 10%"
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20,
          borderRadius: 6
        }}
      />

      <Button
        title="Run Screener"
        onPress={() =>
          navigation.navigate('Results', { query })
        }
      />

      <Text style={{ marginTop: 20, color: 'gray' }}>
        Backend & LLM integration pending
      </Text>
    </View>
  );
}
