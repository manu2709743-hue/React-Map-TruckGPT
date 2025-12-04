/**
 * useLoadData Hook
 * Handles loading JSON data files
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useLoadData = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError = true, showSuccess = false } = options;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
        if (showSuccess) toast.success('Data loaded successfully');
      } catch (err) {
        setError(err.message);
        if (showError) toast.error(`Error loading data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (url) loadData();
  }, [url, showError, showSuccess]);

  return { data, loading, error };
};
