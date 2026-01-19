import { useEffect, useState } from "react";

const useFetch = (apiFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFn()
      .then(res => setData(res.data))
      .catch(() => setError("Unable to fetch data"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

export default useFetch;
