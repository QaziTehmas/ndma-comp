import axios from 'axios';

/**
 * Fetch Air Quality Index data from Open-Meteo Air Quality API
 * https://open-meteo.com/en/docs/air-quality-api
 */
export async function fetchAirQuality(lat, lon) {
    try {
        const url = 'https://air-quality-api.open-meteo.com/v1/air-quality';
        const params = {
            latitude: lat,
            longitude: lon,
            current: ['pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide', 'ozone', 'us_aqi', 'european_aqi'].join(','),
            timezone: 'auto'
        };

        const { data } = await axios.get(url, { params });

        if (!data || !data.current) {
            throw new Error('Invalid air quality data');
        }

        return {
            aqi: data.current.us_aqi || data.current.european_aqi,
            aqiType: data.current.us_aqi ? 'US AQI' : 'European AQI',
            pm25: data.current.pm2_5,
            pm10: data.current.pm10,
            co: data.current.carbon_monoxide,
            no2: data.current.nitrogen_dioxide,
            so2: data.current.sulphur_dioxide,
            o3: data.current.ozone,
            category: getAQICategory(data.current.us_aqi || data.current.european_aqi),
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        throw error;
    }
}

/**
 * Get AQI category and color based on US AQI scale
 */
export function getAQICategory(aqi) {
    if (!aqi) return { level: 'Unknown', color: 'gray', description: 'No data available' };

    if (aqi <= 50) {
        return {
            level: 'Good',
            color: 'green',
            description: 'Air quality is satisfactory',
            icon: '😊'
        };
    } else if (aqi <= 100) {
        return {
            level: 'Moderate',
            color: 'yellow',
            description: 'Acceptable for most people',
            icon: '😐'
        };
    } else if (aqi <= 150) {
        return {
            level: 'Unhealthy for Sensitive Groups',
            color: 'orange',
            description: 'Sensitive individuals may experience health effects',
            icon: '😷'
        };
    } else if (aqi <= 200) {
        return {
            level: 'Unhealthy',
            color: 'red',
            description: 'Everyone may begin to experience health effects',
            icon: '😰'
        };
    } else if (aqi <= 300) {
        return {
            level: 'Very Unhealthy',
            color: 'purple',
            description: 'Health alert: everyone may experience serious effects',
            icon: '🚨'
        };
    } else {
        return {
            level: 'Hazardous',
            color: 'maroon',
            description: 'Emergency conditions: entire population affected',
            icon: '☠️'
        };
    }
}

/**
 * Format pollutant value with unit
 */
export function formatPollutant(value, type) {
    if (value === null || value === undefined) return 'N/A';

    const units = {
        pm25: 'μg/m³',
        pm10: 'μg/m³',
        co: 'μg/m³',
        no2: 'μg/m³',
        so2: 'μg/m³',
        o3: 'μg/m³'
    };

    return `${Math.round(value)} ${units[type] || ''}`;
}
