import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAirQuality } from '../services/airQualityService';

/**
 * Custom hook for fetching air quality data
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 30 minutes)
 * @returns {object} { airQuality, loading, error, refresh, lastUpdated }
 */
export function useAirQuality(latitude, longitude, refreshInterval = 30 * 60 * 1000) {
    const [airQuality, setAirQuality] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async () => {
        if (!latitude || !longitude) {
            setError('Invalid coordinates');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await fetchAirQuality(latitude, longitude);
            setAirQuality(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Error fetching air quality:', err);
            setError(err.message || 'Failed to fetch air quality data');
        } finally {
            setLoading(false);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        if (latitude && longitude) {
            fetchData();

            if (refreshInterval > 0) {
                intervalRef.current = setInterval(fetchData, refreshInterval);
            }

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [latitude, longitude, refreshInterval, fetchData]);

    return {
        airQuality,
        loading,
        error,
        refresh: fetchData,
        lastUpdated
    };
}
