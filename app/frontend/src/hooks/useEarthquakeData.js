import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEarthquakesNearLocation, getEarthquakeActivitySummary } from '../services/earthquakeService';

/**
 * Custom hook for fetching earthquake data near a location
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} radiusKm - Search radius in kilometers (default: 500km)
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 10 minutes)
 * @returns {object} { earthquakes, summary, loading, error, refresh, lastUpdated }
 */
export function useEarthquakeData(latitude, longitude, radiusKm = 100, refreshInterval = 10 * 60 * 1000) {
  const [earthquakes, setEarthquakes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchEarthquakes = useCallback(async () => {
    if (!latitude || !longitude) {
      setError('Invalid coordinates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchEarthquakesNearLocation(latitude, longitude, radiusKm);
      setEarthquakes(data);

      // Calculate summary
      const activitySummary = getEarthquakeActivitySummary(data);
      setSummary(activitySummary);

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching earthquake data:', err);
      setError(err.message || 'Failed to fetch earthquake data');
      setEarthquakes([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radiusKm]);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (latitude && longitude) {
      // Fetch immediately
      fetchEarthquakes();

      // Set up auto-refresh
      if (refreshInterval > 0) {
        intervalRef.current = setInterval(fetchEarthquakes, refreshInterval);
      }

      // Cleanup on unmount or when dependencies change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [latitude, longitude, radiusKm, refreshInterval, fetchEarthquakes]);

  return {
    earthquakes,
    summary,
    loading,
    error,
    refresh: fetchEarthquakes,
    lastUpdated
  };
}
