// frontend/mobile/screens/Results/ResultsScreen.tsx

import React from "react";
import { View, StyleSheet } from "react-native";
import { ResultsView } from "../../components/ResultsView";
import { RouteProp } from "@react-navigation/native";
import { ScreenerResult } from "../../services/api/screener";

type RouteParams = {
  params: {
    status: "loading" | "success" | "empty" | "error";
    results: ScreenerResult[];
    error?: string;
  };
};

interface Props {
  route: RouteProp<RouteParams, "params">;
}

export default function ResultsScreen({ route }: Props) {
  const { status, results, error } = route.params;

  return (
    <View style={styles.container}>
      <ResultsView status={status} results={results} error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
