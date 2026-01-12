import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";

function StockCard({ item }) {
  return (
    <View style={styles.card}>
      <Text style={styles.symbol}>{item.symbol}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>
        {item.sector || "—"} • PE: {item.pe_ratio ?? "—"}
      </Text>
    </View>
  );
}

export default function ResultsScreen({ route, navigation }) {
  const { queryText, results = [], note } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Results</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Edit query</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Query: {queryText || "—"}</Text>
      {!!note && <Text style={styles.note}>{note}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item, idx) => `${item.symbol}-${idx}`}
        renderItem={({ item }) => <StockCard item={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No results (mock screen).</Text>
        }
        contentContainerStyle={{ paddingBottom: 18 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700" },
  link: { fontSize: 14, textDecorationLine: "underline" },
  subtitle: { fontSize: 13, opacity: 0.75 },
  note: { fontSize: 12, opacity: 0.7 },
  empty: { marginTop: 30, opacity: 0.7 },
  card: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginTop: 10 },
  symbol: { fontSize: 18, fontWeight: "700" },
  name: { fontSize: 14, marginTop: 2 },
  meta: { fontSize: 12, opacity: 0.75, marginTop: 4 },
});
