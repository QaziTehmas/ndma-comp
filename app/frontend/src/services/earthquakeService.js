import axios from "axios";

const USGS_FDSN_BASE = "https://earthquake.usgs.gov/fdsnws/event/1/query";

/**
 * Fetch recent earthquakes from USGS
 */
export async function fetchEarthquakes(daysBack = 30, minMagnitude = 2.5) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const params = {
      format: "geojson",
      starttime: startDate.toISOString().split("T")[0],
      endtime: endDate.toISOString().split("T")[0],
      minmagnitude: minMagnitude,
      orderby: "time",
    };

    const { data } = await axios.get(USGS_FDSN_BASE, { params });
    return data;
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    throw error;
  }
}

/**
 * Find nearest earthquake to a given coordinate
 */
export function findNearestEarthquake(
  lat,
  lon,
  earthquakes,
  maxDistanceKm = 100
) {
  if (!earthquakes || earthquakes.length === 0) return null;

  let nearest = null;
  let minDistance = Infinity;

  earthquakes.forEach((quake) => {
    const [quakeLon, quakeLat] = quake.geometry.coordinates;
    const distance = calculateDistance(lat, lon, quakeLat, quakeLon);

    if (distance < minDistance && distance <= maxDistanceKm) {
      minDistance = distance;
      nearest = {
        magnitude: quake.properties.mag,
        place: quake.properties.place,
        time: new Date(quake.properties.time),
        depth: quake.geometry.coordinates[2],
        distance: Math.round(distance),
        url: quake.properties.url,
      };
    }
  });

  return nearest;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Fetch earthquakes near a specific location
 */
export async function fetchEarthquakesNearLocation(lat, lon, radiusKm = 100, daysBack = 7) {
  try {
    // Fetch all recent earthquakes
    const data = await fetchEarthquakes(daysBack, 2.5);

    if (!data || !data.features) {
      return [];
    }

    // Filter earthquakes within radius
    const nearbyQuakes = data.features
      .map(quake => {
        const [quakeLon, quakeLat, depth] = quake.geometry.coordinates;
        const distance = calculateDistance(lat, lon, quakeLat, quakeLon);

        return {
          id: quake.id,
          magnitude: quake.properties.mag,
          place: quake.properties.place,
          time: new Date(quake.properties.time),
          depth: depth,
          distance: Math.round(distance),
          latitude: quakeLat,
          longitude: quakeLon,
          url: quake.properties.url,
          type: quake.properties.type,
        };
      })
      .filter(quake => quake.distance <= radiusKm)
      .sort((a, b) => b.time - a.time); // Sort by most recent first

    return nearbyQuakes;
  } catch (error) {
    console.error('Error fetching earthquakes near location:', error);
    throw error;
  }
}

/**
 * Get earthquake activity summary for a location
 */
export function getEarthquakeActivitySummary(earthquakes) {
  if (!earthquakes || earthquakes.length === 0) {
    return {
      count: 0,
      maxMagnitude: null,
      mostRecent: null,
      riskLevel: 'none'
    };
  }

  const maxMagnitude = Math.max(...earthquakes.map(q => q.magnitude));
  const mostRecent = earthquakes[0]; // Already sorted by time

  // Determine risk level based on magnitude and recency
  let riskLevel = 'low';
  if (maxMagnitude >= 6.0) {
    riskLevel = 'high';
  } else if (maxMagnitude >= 4.5) {
    riskLevel = 'medium';
  }

  // Increase risk if there was a recent strong earthquake (within 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentStrong = earthquakes.filter(q =>
    q.time >= sevenDaysAgo && q.magnitude >= 4.0
  );

  if (recentStrong.length > 0) {
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  return {
    count: earthquakes.length,
    maxMagnitude,
    mostRecent,
    riskLevel,
    recentCount: recentStrong.length
  };
}
