"""
Flood Prediction Service
Uses CatBoost model from Reference Project with feature engineering.
All sklearn patches removed - following Reference Project approach.
"""

import pickle
import pandas as pd
import numpy as np
import os
import traceback

class FloodPredictionService:
    """
    CatBoost-based flood prediction service.
    Uses the improved model, scaler, and selected features from Reference Project.
    """
    
    def __init__(self, model_dir=None):
        """
        Initialize the flood prediction service with model artifacts.
        
        Args:
            model_dir: Directory containing model files. Defaults to 'model/' relative to this file.
        """
        if model_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_dir = os.path.join(base_dir, 'model')
        
        self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.selected_features = []
        
        self._load_artifacts()
    
    def _load_artifacts(self):
        """Load model, scaler, and selected features from disk."""
        try:
            # Load CatBoost model
            model_path = os.path.join(self.model_dir, 'flood_prediction_model_improved.pkl')
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            print("✅ CatBoost model loaded successfully")
            
            # Load scaler
            scaler_path = os.path.join(self.model_dir, 'scaler_improved.pkl')
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            print("✅ Scaler loaded successfully")
            
            # Load selected features
            features_path = os.path.join(self.model_dir, 'selected_features.pkl')
            with open(features_path, 'rb') as f:
                self.selected_features = pickle.load(f)
            print(f"✅ Selected features loaded: {len(self.selected_features)} features")
            
        except FileNotFoundError as e:
            print(f"❌ Model file not found: {e}")
            raise
        except Exception as e:
            print(f"❌ Error loading model artifacts: {e}")
            traceback.print_exc()
            raise
    
    def perform_feature_engineering(self, input_df):
        """
        Perform feature engineering on input data.
        This mirrors the feature engineering in Reference Project's app.py.
        
        Args:
            input_df: DataFrame with input features
            
        Returns:
            DataFrame with engineered features added
        """
        df = input_df.copy()
        
        # 1. Temporal features (already calculated in weather_service, but ensure they exist)
        if 'month' in df.columns:
            if 'is_monsoon_season' not in df.columns:
                df['is_monsoon_season'] = df['month'].isin([6, 7, 8, 9]).astype(int)
            if 'is_peak_rainy' not in df.columns:
                df['is_peak_rainy'] = ((df['month'] >= 7) & (df['month'] <= 9)).astype(int)
        
        # 2. Create interaction features
        if all(col in df.columns for col in ['precipitation_sum', 'temperature_mean']):
            df['precipitation_temp_interaction'] = df['precipitation_sum'] * df['temperature_mean']
        
        if all(col in df.columns for col in ['precipitation_sum', 'precipitation_hours']):
            # Avoid division by zero
            df['precipitation_hours_intensity'] = df['precipitation_sum'] / (df['precipitation_hours'] + 1)
        
        if all(col in df.columns for col in ['rain_sum', 'precipitation_hours']):
            df['rain_intensity'] = df['rain_sum'] / (df['precipitation_hours'] + 1)
        
        if all(col in df.columns for col in ['precipitation_sum', 'evapotranspiration']):
            # Avoid division by zero
            df['precipitation_evap_ratio'] = df['precipitation_sum'] / (df['evapotranspiration'] + 0.1)
        
        if all(col in df.columns for col in ['precipitation_cumsum_7day', 'precipitation_sum']):
            # Avoid division by zero
            df['cumulative_precip_ratio'] = df['precipitation_cumsum_7day'] / (df['precipitation_sum'] + 0.1)
        
        # 3. Create polynomial features
        if 'precipitation_sum' in df.columns:
            df['precipitation_sum_squared'] = df['precipitation_sum'] ** 2
        
        if 'precipitation_cumsum_7day' in df.columns:
            df['precipitation_cumsum_squared'] = df['precipitation_cumsum_7day'] ** 2
        
        if 'temp_range' in df.columns:
            df['temp_range_squared'] = df['temp_range'] ** 2
        
        return df
    
    def predict(self, input_data):
        """
        Predict flood probability and classification.
        
        Args:
            input_data: Dictionary containing all required weather features
                       (from weather_service) plus location_flood_rate
            
        Returns:
            Dictionary with prediction results:
            - flood_probability: Probability of flood (0-1)
            - flood_prediction: Binary prediction (0 or 1)
            - prediction_label: Human-readable prediction
            - probability_percentage: Probability as percentage
        """
        if self.model is None:
            raise ValueError("Model not loaded. Please check model files.")
        
        try:
            # Convert to DataFrame (single row)
            input_df = pd.DataFrame([input_data])
            
            # Perform feature engineering
            input_df = self.perform_feature_engineering(input_df)
            
            # Select and order features based on training
            try:
                X_pred = input_df[self.selected_features]
            except KeyError as e:
                missing_features = [f for f in self.selected_features if f not in input_df.columns]
                available_features = list(input_df.columns)
                raise ValueError(
                    f"Missing required features: {missing_features}\n"
                    f"Available features: {available_features}"
                )
            
            # Scale features
            X_pred_scaled = self.scaler.transform(X_pred)
            
            # Predict
            prediction_class = int(self.model.predict(X_pred_scaled)[0])
            
            # Get probability of flood (class 1)
            prediction_proba = float(self.model.predict_proba(X_pred_scaled)[0][1])
            
            return {
                'flood_probability': prediction_proba,
                'flood_prediction': prediction_class,
                'prediction_label': '⚠️ FLOOD RISK' if prediction_class == 1 else '✓ NO FLOOD',
                'probability_percentage': round(prediction_proba * 100, 2)
            }
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            traceback.print_exc()
            raise ValueError(f"Prediction error: {str(e)}")


# Singleton instance
_prediction_service = None
_model_load_error = None

def get_prediction_service():
    """Get or create the singleton prediction service instance."""
    global _prediction_service, _model_load_error
    
    if _prediction_service is None:
        try:
            _prediction_service = FloodPredictionService()
            _model_load_error = None
        except Exception as e:
            _model_load_error = str(e)
            print(f"⚠️ Model failed to load: {_model_load_error}")
            # Create a placeholder service so server can start
            _prediction_service = FloodPredictionService.__new__(FloodPredictionService)
            _prediction_service.model = None
            _prediction_service.scaler = None
            _prediction_service.selected_features = []
    
    return _prediction_service