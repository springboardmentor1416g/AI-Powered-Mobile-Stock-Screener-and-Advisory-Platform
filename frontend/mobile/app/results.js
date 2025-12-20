import { View, Text, StyleSheet } from "react-native";

export default function ResultsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screener Results</Text>

      <Text style={styles.item}>AAPL</Text>
      <Text style={styles.item}>MSFT</Text>
      <Text style={styles.item}>GOOGL</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    color: "#000000",
  },
  item: {
    fontSize: 18,
    marginBottom: 8,
    color: "#333333",
  },
});
