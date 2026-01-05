import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import colors from '../theme/colors';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={{ padding: 16, backgroundColor: colors.bg }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        AI-Powered Stock Screener & Advisory
      </Text>
      <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
        Explore Indian equities with smart filters and simple, explainable advisory signals.
      </Text>
      <View style={{ gap: 12 }}>
        <Button mode="contained" onPress={() => navigation.navigate('Screener')}>Open Screener</Button>
        <Button mode="outlined" onPress={() => navigation.navigate('Advisory')}>View Advisory</Button>
      </View>
    </ScrollView>
  );
}