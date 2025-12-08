import React, { useState } from 'react';
import './App.css';

// The base features required for prediction, as determined by your notebook's selected_features.pkl
// Note: We only list the base features the user needs to input. The engineered features are
// calculated in the backend.
const initialFormData = {
  day_of_year: 200,
  month: 7,
  precipitation_sum_7day_avg: 40.0,
  precipitation_cumsum_7day: 250.0,
  temperature_mean_7day_avg: 28.0,
  rain_sum_7day_avg: 35.0,
  // precipitation_cumsum_squared: 62500.0, // Engineered
  temperature_mean_3day_avg: 29.0,
  // cumulative_precip_ratio: 5.0, // Engineered
  is_monsoon_season: 1,
  is_peak_rainy: 1,
  precipitation_sum_3day_avg: 30.0,
  rain_sum_3day_avg: 25.0,
  year: 2023,
  day: 19,
  high_cumulative_precip: 1, // Assuming this is a simple 0/1 input like the temporal features
  temp_range: 10.0,
  // temp_range_squared: 100.0, // Engineered
  temperature_min: 23.0,
  temperature_mean: 27.0,
  evapotranspiration: 3.0,
  location_flood_rate: 0.8,
  windgusts_max: 30.0,
  windspeed_max: 20.0,
  temperature_max: 32.0,
  precipitation_sum: 50.0,
  precipitation_hours: 18.0,
  rain_sum: 45.0 // Required for rain_intensity FE
};

// List of features to render in the form (excludes the engineered ones)
const FEATURE_LIST = Object.keys(initialFormData);

function FloodPredictionForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = 'http://127.0.0.1:5000/predict'; // Match your Flask port

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Convert all inputs to float, as the model expects numbers
    const newValue = type === 'number' ? parseFloat(value) : value;

    setFormData(prevData => ({
      ...prevData,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // CORS is handled by flask-cors in the backend, but this is good practice
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Error making prediction:", error);
      setPrediction({ error: 'Failed to connect to the prediction API.' });
    } finally {
      setLoading(false);
    }
  };

  const getPredictionStyle = () => {
    if (prediction && prediction.prediction === 1) {
      return { backgroundColor: '#e74c3c', color: 'white' }; // Red for Flood
    } else if (prediction && prediction.prediction === 0) {
      return { backgroundColor: '#2ecc71', color: 'white' }; // Green for No Flood
    }
    return {};
  };

  return (
    <div className="container">
      <h1>🌊 Flood Prediction Model</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {FEATURE_LIST.map((feature) => (
            <div className="form-group" key={feature}>
              <label htmlFor={feature}>{feature.replace(/_/g, ' ')}</label>
              <input
                type={feature.startsWith('is_') || feature.endsWith('_precip') ? 'number' : 'number'}
                name={feature}
                id={feature}
                value={formData[feature]}
                onChange={handleChange}
                required
                step={feature.startsWith('is_') ? "1" : "any"}
              />
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Predicting...' : 'Get Flood Prediction'}
        </button>
      </form>

      {prediction && (
        <div className="result-box" style={getPredictionStyle()}>
          {prediction.error ? (
            <p className="error">Error: {prediction.error}</p>
          ) : (
            <>
              <h2>Prediction Result</h2>
              <p>Risk Level: <strong>{prediction.risk_level}</strong></p>
              <p>Probability of Flood (Class 1): <strong>{prediction.probability_of_flood.toFixed(4)}</strong></p>
            </>
          )}
        </div>
      )}

      <p className="note">
        * This interface uses the **CatBoost** model trained in your Python notebook via a local **Flask API**.
      </p>
    </div>
  );
}

export default FloodPredictionForm;