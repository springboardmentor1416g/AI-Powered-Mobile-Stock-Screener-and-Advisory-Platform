import { View, Text, Button, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function ScreenerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Screener</Text>

      <Text style={styles.text}>
        Enter screening rules here (API integration coming soon)
      </Text>

      <Button
        title="Run Screener"
        onPress={() => router.push("/results")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  text: {
    marginBottom: 20,
    color: "#555",
  },
});
