/**
 * Calculate distance between two coordinates in kilometers
 * Using Haversine formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Find nearest city from given coordinates
 */
export function findNearestCity(lat, lon, cities) {
    if (!cities || cities.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    cities.forEach(city => {
        const distance = calculateDistance(lat, lon, city.latitude, city.longitude);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = { ...city, distance };
        }
    });

    return nearest;
}

/**
 * Format distance for display
 */
export function formatDistance(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
}
