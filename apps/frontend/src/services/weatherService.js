import axios from "axios";

const HOURLY_PARAMS = [
  "temperature_2m",
  "rain",
  "snowfall",
  "precipitation",
  "surface_pressure",
  "wind_speed_10m",
  "cloud_cover",
  "relative_humidity_2m",
].join(",");

// Open-Meteo Geocoding API
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function fetchOpenMeteo(lat, lon) {
  const url = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude: lat,
    longitude: lon,
    hourly: HOURLY_PARAMS,
    current_weather: true,
    timezone: "auto",
  };

  const { data } = await axios.get(url, { params });
  // Expected fields include elevation and hourly datasets
  return data;
}

export function pickCurrentHourly(data) {
  if (!data || !data.hourly) return null;
  const { time } = data.hourly;
  if (!Array.isArray(time) || time.length === 0) return null;

  const curIso = data.current_weather?.time;
  let idx = curIso ? time.indexOf(curIso) : -1;
  if (idx === -1) {
    // Fallback to nearest by now
    const now = Date.now();
    let best = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < time.length; i++) {
      const d = Math.abs(new Date(time[i]).getTime() - now);
      if (d < bestDiff) {
        best = i;
        bestDiff = d;
      }
    }
    idx = best;
  }
  return idx;
}

/**
 * Fetch comprehensive weather data for a specific location
 * Returns formatted data ready for display
 */
export async function fetchWeatherForLocation(lat, lon) {
  try {
    const data = await fetchOpenMeteo(lat, lon);

    if (!data || !data.current_weather) {
      throw new Error('Invalid weather data received');
    }

    const currentIndex = pickCurrentHourly(data);
    const hourly = data.hourly || {};

    // Extract current values
    const current = {
      temperature: data.current_weather.temperature,
      windSpeed: data.current_weather.windspeed,
      weatherCode: data.current_weather.weathercode,
      time: data.current_weather.time,
    };

    // Extract hourly values at current index
    if (currentIndex !== null && currentIndex >= 0) {
      current.humidity = hourly.relative_humidity_2m?.[currentIndex] || null;
      current.precipitation = hourly.precipitation?.[currentIndex] || 0;
      current.rain = hourly.rain?.[currentIndex] || 0;
      current.pressure = hourly.surface_pressure?.[currentIndex] || null;
      current.cloudCover = hourly.cloud_cover?.[currentIndex] || null;
    }

    // Get 24-hour forecast data
    const forecast24h = extractForecast24h(data);

    return {
      current,
      forecast24h,
      hourly: hourly,
      elevation: data.elevation,
      timezone: data.timezone,
      rawData: data
    };
  } catch (error) {
    console.error('Error fetching weather for location:', error);
    throw error;
  }
}

/**
 * Helper to extract 24h forecast
 */
function extractForecast24h(data) {
  if (!data.hourly || !data.hourly.time) return [];

  const { time: times, ...hourly } = data.hourly;
  const currentIndex = pickCurrentHourly(data);
  const forecast = [];

  // Get next 24 hours starting from current index
  for (let i = 0; i < 24; i++) {
    const index = currentIndex + i;
    if (index >= times.length) break;

    const time = new Date(times[index]);

    forecast.push({
      time: times[index],
      hour: time.getHours(),
      temperature: hourly.temperature_2m?.[index] || null,
      humidity: hourly.relative_humidity_2m?.[index] || null,
      windSpeed: hourly.wind_speed_10m?.[index] || null,
      precipitation: hourly.precipitation?.[index] || 0,
      rain: hourly.rain?.[index] || 0,
      cloudCover: hourly.cloud_cover?.[index] || null,
    });
  }

  return forecast;
}

/**
 * Get weather condition text from weather code
 * https://open-meteo.com/en/docs
 */
export function getWeatherCondition(weatherCode) {
  const conditions = {
    0: 'Clear',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    85: 'Light Snow Showers',
    86: 'Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Hail',
  };

  return conditions[weatherCode] || 'Unknown';
}

/**
 * Search for cities using Open-Meteo Geocoding API - LIMITED TO PAKISTAN ONLY
 * @param {string} query - City name to search for
 * @returns {Promise<Array>} - List of matching cities in Pakistan
 */
export async function searchCities(query) {
  if (!query || query.length < 2) return [];

  try {
    const params = {
      name: query,
      count: 20, // Get more results to filter
      language: 'en',
      format: 'json'
    };

    const { data } = await axios.get(GEOCODING_API_URL, { params });

    if (!data.results) return [];

    // Filter to only Pakistan locations
    const pakistanCities = data.results
      .filter(city => {
        const country = (city.country || '').toLowerCase();
        const countryCode = (city.country_code || '').toLowerCase();
        return country === 'pakistan' || countryCode === 'pk';
      })
      .map(city => ({
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        country: city.country,
        region: city.admin1 || city.country,
        weather: null // Weather will be fetched when selected
      }));

    return pakistanCities;
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

/**
 * Get closest city name from coordinates using Open-Meteo Geocoding API
 * (Reverse Geocoding workaround using finding nearest city)
 */
export async function fetchCityNameFromCoords(lat, lon) {
  try {
    // Open-Meteo doesn't have a direct reverse geocoding endpoint in the free tier easily accessible 
    // without using the "search" by location approximation or just using the closest big city.
    // However, we can use BigDataCloud or OpenStreetMap (Nominatim) for free reverse geocoding.
    // Let's use OpenStreetMap Nominatim as it's free and reliable for this.

    // Using Nominatim API for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'FloodManagementSystem/1.0'
      }
    });

    if (data && data.address) {
      // Try to find the most relevant name: city > town > village > county
      const name = data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        data.address.state_district ||
        "Unknown Location";
      return name;
    }
    return "Custom Location";
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return "Custom Location";
  }
}

/**
 * Fetch weather data for multiple cities in parallel
 * @param {Array} cities - Array of city objects {name, latitude, longitude, ...}
 * @returns {Promise<Array>} - Cities with added weather property
 */
export async function fetchMultipleCities(cities) {
  if (!cities || !Array.isArray(cities) || cities.length === 0) return [];

  try {
    const promises = cities.map(async (city) => {
      try {
        const weather = await fetchWeatherForLocation(city.latitude, city.longitude);
        return { ...city, weather };
      } catch (error) {
        console.warn(`Failed to fetch weather for ${city.name}`, error);
        return { ...city, weather: null };
      }
    });

    return await Promise.all(promises);
  } catch (error) {
    console.error("Error fetching multiple cities:", error);
    return cities;
  }
}
