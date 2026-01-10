import { View, Text, FlatList, Alert } from "react-native";
import { useState } from "react";
import QueryInput from "../components/QueryInput";
import StockCard from "../components/StockCard";
import { runScreener } from "../services/api";

export default function ScreenerScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function handleSearch() {
    try {
      const data = await runScreener(query);
      setResults(data.results);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        AI Stock Screener
      </Text>

      <QueryInput
        query={query}
        setQuery={setQuery}
        onSubmit={handleSearch}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => <StockCard stock={item} />}
      />
    </View>
  );
}
