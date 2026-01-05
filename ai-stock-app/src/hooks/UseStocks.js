import { useEffect, useState } from 'react';
import { fetchStocks } from '../services/api';

export default function useStocks(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchStocks(filters);
      setStocks(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [JSON.stringify(filters)]); // retrigger when filters change

  return { stocks, filters, setFilters, loading, reload: load };
}