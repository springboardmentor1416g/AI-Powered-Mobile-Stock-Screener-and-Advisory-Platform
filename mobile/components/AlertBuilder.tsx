import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { UserDataService } from '../services/api';

export const AlertBuilder = ({ ticker, userId }: { ticker: string, userId: string }) => {
  const [priceTarget, setPriceTarget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAlert = async () => {
    if (!priceTarget) {
      Alert.alert("Input Error", "Please enter a price target.");
      return;
    }

    setLoading(true);
    try {
      // Matches your ERD structure for 'user_alerts'
      await UserDataService.createAlert({
        user_id: userId,
        ticker: ticker,
        condition_json: JSON.stringify({ 
          operator: '>', 
          value: parseFloat(priceTarget) 
        }),
        is_active: true
      });
      
      Alert.alert("Success", `Alert set for ${ticker} above $${priceTarget}`);
      setPriceTarget(''); // Clear input
    } catch (e) {
      Alert.alert("Error", "Could not create alert. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Price Alert for {ticker}</Text>
      <Text style={styles.subLabel}>Notify me when price goes above:</Text>
      
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric"
          placeholder="150.00"
          placeholderTextColor="#64748b"
          value={priceTarget}
          onChangeText={setPriceTarget}
        />
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCreateAlert}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Set Alert</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    backgroundColor: '#1e293b', // Dark Card Background
    borderRadius: 12, 
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 4 
  },
  subLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10
  },
  input: { 
    flex: 1,
    borderWidth: 1, 
    borderColor: '#334155', 
    padding: 12, 
    borderRadius: 8, 
    backgroundColor: '#0f172a', // Darker Input Background
    color: 'white',
    fontSize: 16
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});