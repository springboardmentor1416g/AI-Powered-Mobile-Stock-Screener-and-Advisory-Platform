import React from "react";
import { FlatList } from "react-native";
import ResultCard from "./ResultCard";
import { CompanyScreenerResult } from "../../types/screener.types";

export default function ScreenerResultsScreen({ route, navigation }) {
  const results: CompanyScreenerResult[] = route.params.results;

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.ticker}
      renderItem={({ item }) => (
        <ResultCard
          data={item}
          onPress={() =>
            navigation.navigate("CompanyDetail", { company: item })
          }
        />
      )}
    />
  );
}
