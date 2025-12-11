import { useState, useEffect } from 'react';

/**
 * Custom hook for loading data with loading and error states
 * @param {Function} loaderFunction - Async function that loads data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} { data, loading, error, refetch }
 */
export const useData = (loaderFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loaderFunction();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

/**
 * Custom hook for loading multiple data sources
 * @param {Object} loaders - Object with keys as data names and values as loader functions
 * @returns {Object} { data, loading, error, refetch }
 */
export const useMultipleData = (loaders) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const entries = Object.entries(loaders);
      const results = await Promise.all(
        entries.map(([key, loader]) => loader())
      );
      
      const dataObject = {};
      entries.forEach(([key], index) => {
        dataObject[key] = results[index];
      });
      
      setData(dataObject);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error('Multiple data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchAllData
  };
};

export default useData;
