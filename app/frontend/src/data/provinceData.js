/**
 * Simplified province boundaries for Pakistan
 * Using representative center points and circles for simplicity
 */

export const PROVINCES = [
    {
        name: 'Punjab',
        center: [31.1704, 72.7097],
        radius: 300000, // 300km radius
        color: '#ef4444'
    },
    {
        name: 'Sindh',
        center: [26.0, 68.5],
        radius: 250000,
        color: '#f59e0b'
    },
    {
        name: 'Khyber Pakhtunkhwa',
        center: [34.5, 72.0],
        radius: 200000,
        color: '#10b981'
    },
    {
        name: 'Balochistan',
        center: [28.5, 65.0],
        radius: 350000,
        color: '#3b82f6'
    },
    {
        name: 'Gilgit-Baltistan',
        center: [35.5, 75.0],
        radius: 150000,
        color: '#8b5cf6'
    }
];

/**
 * Calculate risk score for a province based on weather data
 */
export function calculateProvinceRisk(provinceName, cities) {
    // Filter cities that belong to this province (approximate by distance to center)
    const province = PROVINCES.find(p => p.name === provinceName);
    if (!province) return 0;

    const provinceCities = cities.filter(city => {
        if (!city.weather?.current) return false;
        const distance = Math.sqrt(
            Math.pow(city.latitude - province.center[0], 2) +
            Math.pow(city.longitude - province.center[1], 2)
        ) * 111; // Rough km conversion
        return distance < (province.radius / 1000);
    });

    if (provinceCities.length === 0) return 0;

    // Calculate average metrics
    const temps = provinceCities.map(c => c.weather.current.temperature || 0);
    const humidities = provinceCities.map(c => c.weather.current.humidity || 0);

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

    // Risk calculation
    // Temperature risk: 20-45°C mapped to 0-100
    const tempRisk = Math.max(0, Math.min(100, ((avgTemp - 20) / 25) * 100));

    // Humidity risk: directly 0-100
    const humidityRisk = avgHumidity;

    // Combined risk (weighted average)
    const risk = (tempRisk * 0.6 + humidityRisk * 0.4);

    return Math.round(risk);
}

/**
 * Get risk color based on score
 */
export function getRiskColor(risk) {
    if (risk < 20) return { color: '#10b981', label: 'Low Risk' };
    if (risk < 40) return { color: '#3b82f6', label: 'Moderate' };
    if (risk < 60) return { color: '#f59e0b', label: 'Elevated' };
    if (risk < 80) return { color: '#ef4444', label: 'High Risk' };
    return { color: '#dc2626', label: 'Very High' };
}
