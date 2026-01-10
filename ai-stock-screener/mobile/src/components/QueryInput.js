import { View, TextInput, Button } from "react-native";

export default function QueryInput({ query, setQuery, onSubmit }) {
  return (
    <View>
      <TextInput
        placeholder="Ask in plain English (e.g. PE below 5...)"
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
          borderRadius: 5
        }}
      />
      <Button title="Run Screener" onPress={onSubmit} />
    </View>
  );
}
