import { PYTHON_BACKEND_URL } from '../config/env';

// Use dynamic backend URL configuration
const BACKEND_URL = PYTHON_BACKEND_URL;

export async function predictFlood(predictionData) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/flood-prediction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(predictionData),
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
    const response = await fetch(`${BACKEND_URL}/api/flood-prediction/current`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: locationData.location,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        year: new Date().getFullYear(), // Will be ignored by backend
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
      }),
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

