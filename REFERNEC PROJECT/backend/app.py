import pandas as pd
import numpy as np
import pickle
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
# Note: CatBoost, scikit-learn, and numpy are required to load the model/scaler

app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

# --- Load Artifacts ---
try:
    with open('flood_prediction_model_improved.pkl', 'rb') as f:
        MODEL = pickle.load(f)
    with open('scaler_improved.pkl', 'rb') as f:
        SCALER = pickle.load(f)
    with open('selected_features.pkl', 'rb') as f:
        SELECTED_FEATURES = pickle.load(f)
    print("✅ Model, Scaler, and Features loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model artifacts: {e}")
    MODEL = None
    SCALER = None
    SELECTED_FEATURES = []

# --- Feature Engineering Function (Must mirror your notebook) ---
def perform_feature_engineering(input_df):
    # Ensure all columns required for feature engineering are present
    
    # 1. Encode categorical features (if applicable, your data only had 'season' which was encoded before this step)
    # The current notebook cell for FE starts from a clean df_improved copy, 
    # so we'll ensure the input DataFrame has the features needed for subsequent FE steps.
    
    # Check for 'month' to create temporal features
    if 'month' in input_df.columns:
        input_df['is_monsoon_season'] = input_df['month'].isin([6, 7, 8, 9]).astype(int)
        input_df['is_peak_rainy'] = ((input_df['month'] >= 7) & (input_df['month'] <= 9)).astype(int)

    # 2. Create interaction features
    # Check for all required columns before creating the feature
    if all(col in input_df.columns for col in ['precipitation_sum', 'temperature_mean']):
        input_df['precipitation_temp_interaction'] = input_df['precipitation_sum'] * input_df['temperature_mean']
    
    if all(col in input_df.columns for col in ['precipitation_sum', 'precipitation_hours']):
        # Avoid division by zero
        input_df['precipitation_hours_intensity'] = input_df['precipitation_sum'] / (input_df['precipitation_hours'] + 1)
        
    if all(col in input_df.columns for col in ['rain_sum', 'precipitation_hours']):
        input_df['rain_intensity'] = input_df['rain_sum'] / (input_df['precipitation_hours'] + 1)

    if all(col in input_df.columns for col in ['precipitation_sum', 'evapotranspiration']):
        # Avoid division by zero
        input_df['precipitation_evap_ratio'] = input_df['precipitation_sum'] / (input_df['evapotranspiration'] + 0.1)

    if all(col in input_df.columns for col in ['precipitation_cumsum_7day', 'precipitation_sum']):
        # Avoid division by zero
        input_df['cumulative_precip_ratio'] = input_df['precipitation_cumsum_7day'] / (input_df['precipitation_sum'] + 0.1)

    # 3. Create polynomial features
    if 'precipitation_sum' in input_df.columns:
        input_df['precipitation_sum_squared'] = input_df['precipitation_sum'] ** 2
        
    if 'precipitation_cumsum_7day' in input_df.columns:
        input_df['precipitation_cumsum_squared'] = input_df['precipitation_cumsum_7day'] ** 2
        
    if 'temp_range' in input_df.columns:
        input_df['temp_range_squared'] = input_df['temp_range'] ** 2

    # 4. Create weather severity indicators (using a simplified 0/1 based on quantile, 
    # but for a real-time system, you'd need the actual quantile value from training or 
    # just use a predefined threshold). For this API, we will **skip** # these quantile-based features ('extreme_precipitation', 'extreme_rain', 'high_cumulative_precip') 
    # as they require the entire training distribution to be calculated correctly 
    # on single-row input, which is non-trivial. Let's assume you'll remove these 
    # features from SELECTED_FEATURES for simplicity, or re-engineer them as simple 
    # threshold checks based on the 0.9 quantile values you observed in training.
    # For now, we rely on the notebook that shows these features were in the top 25, 
    # but let's re-add them as 0/1 based on some placeholder high-value thresholds 
    # to complete the set. (Note: A robust solution would save the threshold).
    # Based on the feature selection output, these 3 features are critical. 
    # We must assume the user provides them, or that they are computed correctly.
    # To be practical for a single API call, we'll assume the client provides a 0 or 1 
    # for these features as they did for 'is_monsoon_season'. 
    # Since the sample data was provided as 0/1, we'll assume the FE step 
    # in the notebook meant the original columns are required.
    
    # The notebook implicitly uses all non-removed numeric features:
    # ['day_of_year', 'month', 'precipitation_sum_7day_avg', 'precipitation_cumsum_7day', 
    #  'temperature_mean_7day_avg', 'rain_sum_7day_avg', 'precipitation_cumsum_squared', 
    #  'temperature_mean_3day_avg', 'cumulative_precip_ratio', 'is_monsoon_season', 
    #  'is_peak_rainy', 'precipitation_sum_3day_avg', 'rain_sum_3day_avg', 'year', 'day', 
    #  'high_cumulative_precip', 'temp_range', 'temp_range_squared', 'temperature_min', 
    #  'temperature_mean', 'evapotranspiration', 'location_flood_rate', 'windgusts_max', 
    #  'windspeed_max', 'temperature_max']
    # If the client provides all base features, the FE above covers the engineered ones.

    return input_df

@app.route('/predict', methods=['POST'])
def predict_flood_api():
    if MODEL is None:
        return jsonify({'error': 'Model not loaded.'}), 500
    
    try:
        # 1. Get JSON data from the request
        data = request.get_json(force=True)
        # Create a DataFrame from the single input record
        input_df = pd.DataFrame([data])
        
        # 2. Perform Feature Engineering
        input_df = perform_feature_engineering(input_df)

        # 3. Select and order features based on training
        X_pred = input_df[SELECTED_FEATURES]
        
        # 4. Scale features
        X_pred_scaled = SCALER.transform(X_pred)
        
        # 5. Predict
        prediction_class = int(MODEL.predict(X_pred_scaled)[0])
        # Probability of class 1 (Flood)
        prediction_proba = float(MODEL.predict_proba(X_pred_scaled)[0][1])

        # 6. Return response
        result = {
            'prediction': prediction_class,
            'probability_of_flood': prediction_proba,
            'risk_level': 'Flood' if prediction_class == 1 else 'No Flood'
        }
        
        return jsonify(result)

    except Exception as e:
        print("❌ Prediction error:", e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Flood Prediction API is running.'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)