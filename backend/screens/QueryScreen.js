import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import { runNLQuery } from "../services/screenerApi";

export default function QueryScreen({ navigation }) {
  const [query, setQuery] = useState("");

  const submitQuery = async () => {
    const result = await runNLQuery(query);
    navigation.navigate("Results", { result });
  };

  return (
    <View>
      <TextInput
        placeholder="Enter stock screening query"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Run Screener" onPress={submitQuery} />
    </View>
  );
}
