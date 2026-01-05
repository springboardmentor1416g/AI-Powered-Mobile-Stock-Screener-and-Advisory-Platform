import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Chip } from 'react-native-paper';

export default function FilterBar({ initial = {}, onApply }) {
  const [sector, setSector] = useState(initial.sector || '');
  const [maxPE, setMaxPE] = useState(initial.maxPE?.toString() || '');
  const [minCap, setMinCap] = useState(initial.minCap?.toString() || '');

  return (
    <View style={{ gap: 8, marginBottom: 12 }}>
      <TextInput label="Sector (e.g., IT, Energy)" value={sector} onChangeText={setSector} />
      <TextInput label="Max P/E" keyboardType="numeric" value={maxPE} onChangeText={setMaxPE} />
      <TextInput label="Min Market Cap (₹ Cr)" keyboardType="numeric" value={minCap} onChangeText={setMinCap} />
      <Button mode="contained" onPress={() => onApply?.({ sector, maxPE, minCap })}>Apply filters</Button>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {sector ? <Chip icon="filter">Sector: {sector}</Chip> : null}
        {maxPE ? <Chip icon="filter">P/E ≤ {maxPE}</Chip> : null}
        {minCap ? <Chip icon="filter">Cap ≥ ₹{minCap}</Chip> : null}
      </View>
    </View>
  );
}
