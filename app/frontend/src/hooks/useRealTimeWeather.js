import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeatherForLocation } from '../services/weatherService';

/**
 * Custom hook for fetching and auto-refreshing weather data
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 5 minutes)
 * @returns {object} { weatherData, loading, error, refresh, lastUpdated }
 */
export function useRealTimeWeather(latitude, longitude, refreshInterval = 5 * 60 * 1000) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchWeather = useCallback(async () => {
    if (!latitude || !longitude) {
      setError('Invalid coordinates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherForLocation(latitude, longitude);
      setWeatherData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (latitude && longitude) {
      // Fetch immediately
      fetchWeather();

      // Set up auto-refresh
      if (refreshInterval > 0) {
        intervalRef.current = setInterval(fetchWeather, refreshInterval);
      }

      // Cleanup on unmount or when dependencies change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [latitude, longitude, refreshInterval, fetchWeather]);

  return {
    weatherData,
    loading,
    error,
    refresh: fetchWeather,
    lastUpdated
  };
}
