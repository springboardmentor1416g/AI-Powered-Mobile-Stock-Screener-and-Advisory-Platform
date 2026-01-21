import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { runScreener } from "../../src/services/api";
import { saveResults } from "../../src/storage/tempResults";


export default function ScreenerScreen() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRunScreener() {
    try {
      setLoading(true);

      const response = await runScreener(query);
      saveResults(response.results);
      router.push({
        pathname: "/results",
        params: {
          data: JSON.stringify(response.results),
        },
      });
    } catch (error) {
      alert("Network issue. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Enter Screener Query
      </Text>

      <TextInput
        placeholder="e.g. PE &lt; 10 and promoter holding &gt; 50"
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 20,
          backgroundColor: "#ffffff",  
          color: "#000000",
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          title="Run Screener"
          onPress={handleRunScreener}
        />
      )}
    </View>
  );
}
