import { useCallback, useEffect, useState } from 'react';
import client from '../api/client.js';

/** GET hook → { data, loading, error, refetch }. `params` changes retrigger the fetch. */
export default function useFetch(path, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState('');
  const paramsKey = JSON.stringify(params ?? null);

  const refetch = useCallback(() => {
    if (!path) return undefined;

    let cancelled = false;
    const controller = typeof AbortController === 'undefined' ? null : new AbortController();
    setLoading(true);

    client
      .get(path, { params, signal: controller?.signal })
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled && !controller?.signal.aborted) setError(err.userMessage || 'Unable to load this content.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, paramsKey]);

  useEffect(() => refetch(), [refetch]);

  return { data, loading, error, refetch };
}
