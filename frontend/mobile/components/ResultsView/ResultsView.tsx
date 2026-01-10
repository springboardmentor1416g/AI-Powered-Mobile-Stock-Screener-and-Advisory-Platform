// frontend/mobile/components/ResultsView/ResultsView.tsx

import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import ResultCard from "./ResultCard";
import { ScreenerResult } from "../../services/api/screener";

type Status = "loading" | "success" | "empty" | "error";

interface Props {
  status: Status;
  results: ScreenerResult[];
  error?: string;
}

export default function ResultsView({ status, results, error }: Props) {
  if (status === "loading") {
    return <ActivityIndicator size="large" />;
  }

  if (status === "error") {
    return <Text>❌ {error || "Something went wrong"}</Text>;
  }

  if (status === "empty") {
    return <Text>📭 No stocks matched your criteria</Text>;
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.symbol}
      renderItem={({ item }) => <ResultCard item={item} />}
    />
  );
}
