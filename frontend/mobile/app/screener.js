import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function ScreenerScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Screener</Text>

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
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#000000",
  },
});
