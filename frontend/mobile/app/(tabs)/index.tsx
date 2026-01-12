import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { autoLogin } from "../../src/services/api";

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    autoLogin();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Welcome to Stock Screener
      </Text>

      <Button
        title="Go to Screener"
        onPress={() => router.push("/(tabs)/explore")}
      />
    </View>
  );
}
