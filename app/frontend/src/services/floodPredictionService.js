import { PYTHON_BACKEND_URL } from '../config/env';

// Use dynamic backend URL configuration
const BACKEND_URL = PYTHON_BACKEND_URL;

export async function predictFlood(predictionData) {
  try {
    // 1. Fetch historical weather data directly from browser to bypass Render outbound IP limits
    const targetDate = new Date(predictionData.year, predictionData.month - 1, predictionData.day);
    const startDate = new Date(targetDate);
    startDate.setDate(targetDate.getDate() - 7);

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(targetDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((today - targetDate) / (1000 * 60 * 60 * 24));

    const isFuture = targetDate > today;
    const apiBase = (isFuture || diffDays <= 30) 
      ? 'https://api.open-meteo.com/v1/forecast' 
      : 'https://archive-api.open-meteo.com/v1/archive';

    const dailyParams = [
      "temperature_2m_max",
      "temperature_2m_min",
      "temperature_2m_mean",
      "precipitation_sum",
      "rain_sum",
      "precipitation_hours",
      "windspeed_10m_max",
      "windgusts_10m_max",
      "et0_fao_evapotranspiration",
      "weather_code"
    ].join(",");

    const queryUrl = `${apiBase}?latitude=${predictionData.latitude}&longitude=${predictionData.longitude}&start_date=${startDateStr}&end_date=${endDateStr}&daily=${dailyParams}&timezone=auto`;

    let rawWeatherData = null;
    try {
      const weatherRes = await fetch(queryUrl);
      if (weatherRes.ok) {
        rawWeatherData = await weatherRes.json();
      }
    } catch (err) {
      console.warn("Failed to fetch weather data directly from browser:", err);
    }

    const payload = {
      ...predictionData,
      raw_weather_data: rawWeatherData
    };

    const response = await fetch(`${BACKEND_URL}/api/flood-prediction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get prediction';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        // If response is not JSON, try to get text
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch (e2) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error predicting flood:', error);
    throw error;
  }
}

/**
 * Predict flood risk for current date using selected location
 * @param {Object} locationData - Contains location, latitude, longitude
 * @returns {Promise<Object>} Prediction result with probability, prediction, weather_data
 */
export async function predictFloodCurrent(locationData) {
  try {
    // 1. Fetch current weather data directly from browser to bypass Render outbound IP limits
    const targetDate = new Date();
    const startDate = new Date(targetDate);
    startDate.setDate(targetDate.getDate() - 7);

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(targetDate);

    const apiBase = 'https://api.open-meteo.com/v1/forecast';

    const dailyParams = [
      "temperature_2m_max",
      "temperature_2m_min",
      "temperature_2m_mean",
      "precipitation_sum",
      "rain_sum",
      "precipitation_hours",
      "windspeed_10m_max",
      "windgusts_10m_max",
      "et0_fao_evapotranspiration",
      "weather_code"
    ].join(",");

    const queryUrl = `${apiBase}?latitude=${locationData.latitude}&longitude=${locationData.longitude}&start_date=${startDateStr}&end_date=${endDateStr}&daily=${dailyParams}&timezone=auto`;

    let rawWeatherData = null;
    try {
      const weatherRes = await fetch(queryUrl);
      if (weatherRes.ok) {
        rawWeatherData = await weatherRes.json();
      }
    } catch (err) {
      console.warn("Failed to fetch current weather data directly from browser:", err);
    }

    const payload = {
      location: locationData.location,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      raw_weather_data: rawWeatherData
    };

    const response = await fetch(`${BACKEND_URL}/api/flood-prediction/current`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get current prediction';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch (e2) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error predicting current flood:', error);
    throw error;
  }
}

