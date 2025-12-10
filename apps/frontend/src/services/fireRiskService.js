// Fire Risk Prediction Service
// Calls the backend API for fire risk predictions

const BACKEND_URL = import.meta.env.DEV ? '' : 'http://localhost:8000';

/**
 * Predict fire risk for a location and date.
 * All weather parameters are fetched automatically from OpenMeteo.
 * 
 * @param {Object} predictionData - Contains year, month, day, location, latitude, longitude
 * @returns {Promise<Object>} Prediction result with probability, fire_risk, message, weather_data
 */
export async function predictFireRisk(predictionData) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/fire-prediction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(predictionData),
        });

        if (!response.ok) {
            let errorMessage = 'Failed to get fire risk prediction';
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
        console.error('Error predicting fire risk:', error);
        throw error;
    }
}

/**
 * Predict fire risk for current date using selected location
 * @param {Object} locationData - Contains location, latitude, longitude
 * @returns {Promise<Object>} Prediction result with probability, fire_risk, message, weather_data
 */
export async function predictFireRiskCurrent(locationData) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/fire-prediction/current`, {
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
            let errorMessage = 'Failed to get current fire risk prediction';
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
        console.error('Error predicting current fire risk:', error);
        throw error;
    }
}

/**
 * Get the fire model status.
 * 
 * @returns {Promise<Object>} Model status with status, model_type, features_count
 */
export async function getFireModelStatus() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/fire-model-status`);
        return await response.json();
    } catch (error) {
        console.error('Error getting fire model status:', error);
        throw error;
    }
}
