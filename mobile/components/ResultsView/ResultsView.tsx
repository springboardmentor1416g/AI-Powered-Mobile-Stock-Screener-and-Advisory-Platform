import React, { useEffect, useState } from "react";
import { View, FlatList, Text, ActivityIndicator } from "react-native";
import ResultCard from "./ResultCard";

interface StockResult {
  companyName: string;
  symbol: string;
  peRatio?: number;
  revenueGrowth?: number;
  marketCap?: number;
}

const ResultsView = () => {
  const [data, setData] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("API_ENDPOINT/screener/results")
      .then(res => res.json())
      .then(response => {
        setData(response.results || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to fetch screener results.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (data.length === 0) {
    return <Text>No stocks matched your criteria.</Text>;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.symbol}
      renderItem={({ item }) => <ResultCard stock={item} />}
    />
  );
};

export default ResultsView;
