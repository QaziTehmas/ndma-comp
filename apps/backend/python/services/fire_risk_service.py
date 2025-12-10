"""
Fire Risk Prediction Service
Uses XGBoost model with feature engineering for wildfire risk prediction.
"""

import os
import numpy as np
import pandas as pd
import xgboost as xgb
import joblib
from datetime import datetime
import traceback

class FireRiskService:
    """
    XGBoost-based fire risk prediction service.
    Uses the wildfire model, preprocessor, and features list from Reference Project.
    """
    
    def __init__(self, model_dir=None):
        """
        Initialize the fire risk prediction service with model artifacts.
        
        Args:
            model_dir: Directory containing model files. Defaults to 'model/' relative to this file.
        """
        if model_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_dir = os.path.join(base_dir, 'model')
        
        self.model_dir = model_dir
        self.model = None
        self.preprocessor = None
        self.features_list = []
        
        self._load_artifacts()
    
    def _load_artifacts(self):
        """Load model, preprocessor, and features list from disk."""
        try:
            # Load XGBoost model
            model_path = os.path.join(self.model_dir, 'xgb_wildfire_model.json')
            self.model = xgb.Booster()
            self.model.load_model(model_path)
            print("✅ XGBoost wildfire model loaded successfully")
            
            # Load preprocessor (with fallback for sklearn version compatibility)
            try:
                preprocessor_path = os.path.join(self.model_dir, 'preprocessor.joblib')
                self.preprocessor = joblib.load(preprocessor_path)
                print("✅ Preprocessor loaded successfully")
            except Exception as e:
                print(f"⚠️ Preprocessor joblib failed (sklearn version mismatch): {e}")
                print("   Creating fallback preprocessor (StandardScaler + SimpleImputer)")
                from sklearn.preprocessing import StandardScaler
                from sklearn.impute import SimpleImputer
                from sklearn.pipeline import Pipeline
                
                # Create a simple fallback preprocessor
                self.preprocessor = Pipeline([
                    ('imputer', SimpleImputer(strategy='median')),
                    ('scaler', StandardScaler())
                ])
                # Mark as not fitted
                self._preprocessor_fitted = False
            else:
                self._preprocessor_fitted = True
            
            # Load features list
            features_path = os.path.join(self.model_dir, 'features_list.joblib')
            self.features_list = joblib.load(features_path)
            print(f"✅ Features list loaded: {len(self.features_list)} features")
            
        except FileNotFoundError as e:
            print(f"❌ Model file not found: {e}")
            raise
        except Exception as e:
            print(f"❌ Error loading fire risk model artifacts: {e}")
            traceback.print_exc()
            raise
    
    def perform_feature_engineering(self, input_df, date_str):
        """
        Perform feature engineering on input data.
        This mirrors the feature engineering in Reference Project's app.py.
        
        Args:
            input_df: DataFrame with input features
            date_str: Date string in YYYY-MM-DD format
            
        Returns:
            DataFrame with engineered features added
        """
        df = input_df.copy()
        
        # 1. Date Processing
        date_val = datetime.strptime(date_str, "%Y-%m-%d")
        df['DAY_OF_YEAR'] = date_val.timetuple().tm_yday
        df['MONTH'] = date_val.month
        
        # 2. Temperature Conversion (Celsius -> Fahrenheit for model)
        # OpenMeteo returns Celsius, model expects Fahrenheit
        df['MAX_TEMP'] = (df['MAX_TEMP'] * 9/5) + 32
        df['MIN_TEMP'] = (df['MIN_TEMP'] * 9/5) + 32
        
        # 3. Feature Engineering
        df['TEMP_RANGE'] = df['MAX_TEMP'] - df['MIN_TEMP']
        df['WIND_TEMP_RATIO'] = df['AVG_WIND_SPEED'] / (df['MAX_TEMP'].replace(0, np.nan))
        
        # 4. Rename columns to match model features
        df = df.rename(columns={
            'LAGGED_PRECIPITATION': 'PRECIP_1D_LAG',
            'LAGGED_AVG_WIND_SPEED': 'WIND_1D_LAG'
        })
        
        # 5. Rolling features (placeholder - using NaN for single sample, preprocessor handles imputation)
        df['ROLL_7D_PRECIP_SUM'] = np.nan
        df['ROLL_7D_TEMP_MEAN'] = np.nan
        
        # 6. Cyclic encoding
        df['DOY_SIN'] = np.sin(2 * np.pi * df['DAY_OF_YEAR'] / 366)
        df['DOY_COS'] = np.cos(2 * np.pi * df['DAY_OF_YEAR'] / 366)
        df['MONTH_SIN'] = np.sin(2 * np.pi * (df['MONTH'] - 1) / 12)
        df['MONTH_COS'] = np.cos(2 * np.pi * (df['MONTH'] - 1) / 12)
        
        return df
    
    def predict(self, input_data):
        """
        Predict fire risk probability.
        
        Args:
            input_data: Dictionary containing weather features from OpenMeteo:
                - date: YYYY-MM-DD format (REQUIRED)
                - MAX_TEMP: Maximum temperature (Celsius)
                - MIN_TEMP: Minimum temperature (Celsius)
                - AVG_WIND_SPEED: Average wind speed (mph)
                - PRECIPITATION: Precipitation (inches)
                - LAGGED_PRECIPITATION: Yesterday's precipitation (inches)
                - LAGGED_AVG_WIND_SPEED: Yesterday's wind speed (mph)
            
        Returns:
            Dictionary with prediction results:
            - probability: Fire risk probability (0-1)
            - fire_risk: Boolean indicating high risk
            - message: Human-readable risk level
            - risk_percentage: Probability as percentage
        """
        if self.model is None:
            raise ValueError("Fire risk model not loaded. Please check model files.")
        
        try:
            # Extract date - ensure it's in correct format
            date_str = input_data.get('date')
            if not date_str:
                # Fallback: construct from year, month, day if date not provided
                year = input_data.get('year')
                month = input_data.get('month')
                day = input_data.get('day')
                if year and month and day:
                    date_str = f"{year}-{month:02d}-{day:02d}"
                else:
                    date_str = datetime.now().strftime('%Y-%m-%d')
            
            location = input_data.get('location', 'N/A')
            print(f"🔥 Fire Prediction - Date: {date_str}, Location: {location}")
            print(f"🔥 Weather Data - Max Temp: {input_data.get('MAX_TEMP', 'N/A')}°C, "
                  f"Min Temp: {input_data.get('MIN_TEMP', 'N/A')}°C, "
                  f"Wind: {input_data.get('AVG_WIND_SPEED', 'N/A')} mph, "
                  f"Precip: {input_data.get('PRECIPITATION', 'N/A')} in")
            
            # Print input data structure for debugging (production: remove or reduce)
            import json
            print(f"🔥 Input Data Keys ({len(input_data)} fields): {list(input_data.keys())}")
            print(f"🔥 Input Data Sample (first 10 fields):")
            sample_data = {k: v for i, (k, v) in enumerate(input_data.items()) if i < 10}
            print(json.dumps(sample_data, indent=2, default=str))
            
            # Create DataFrame from input
            input_df = pd.DataFrame([input_data])
            
            # Perform feature engineering
            input_df = self.perform_feature_engineering(input_df, date_str)
            
            # Select and order features based on training
            try:
                sample_X = input_df[self.features_list]
            except KeyError as e:
                missing_features = [f for f in self.features_list if f not in input_df.columns]
                available_features = list(input_df.columns)
                print(f"❌ Missing features: {missing_features}")
                print(f"📋 Available features: {available_features}")
                raise ValueError(
                    f"Missing required features: {missing_features}\n"
                    f"Available features: {available_features}"
                )
            
            # Apply preprocessor (scaling/imputation)
            if hasattr(self, '_preprocessor_fitted') and not self._preprocessor_fitted:
                sample_values = sample_X.fillna(sample_X.median()).values
                from sklearn.preprocessing import StandardScaler
                scaler = StandardScaler()
                sample_X_p = scaler.fit_transform(sample_values)
            else:
                sample_X_p = self.preprocessor.transform(sample_X)
            
            # Create DMatrix and predict
            dtest = xgb.DMatrix(sample_X_p)
            prediction_prob = float(self.model.predict(dtest)[0])
            prediction_class = int(prediction_prob >= 0.5)
            
            # Determine risk level
            if prediction_prob >= 0.7:
                risk_level = "Extreme Fire Risk"
            elif prediction_prob >= 0.5:
                risk_level = "High Fire Risk"
            elif prediction_prob >= 0.3:
                risk_level = "Moderate Fire Risk"
            else:
                risk_level = "Low Fire Risk"
            
            print(f"🔥 Prediction Result - Date: {date_str}, Location: {location}, "
                  f"Probability: {prediction_prob:.4f} ({prediction_prob*100:.2f}%), "
                  f"Risk Level: {risk_level}")
            
            return {
                'probability': prediction_prob,
                'fire_risk': bool(prediction_class),
                'message': risk_level,
                'risk_percentage': round(prediction_prob * 100, 2)
            }
            
        except Exception as e:
            print(f"❌ Fire risk prediction error: {e}")
            traceback.print_exc()
            raise ValueError(f"Fire risk prediction error: {str(e)}")


# Singleton instance
_fire_risk_service = None
_model_load_error = None

def get_fire_risk_service():
    """Get or create the singleton fire risk service instance."""
    global _fire_risk_service, _model_load_error
    
    if _fire_risk_service is None:
        try:
            _fire_risk_service = FireRiskService()
            _model_load_error = None
        except Exception as e:
            _model_load_error = str(e)
            print(f"⚠️ Fire risk model failed to load: {_model_load_error}")
            # Create placeholder service so server can start
            _fire_risk_service = FireRiskService.__new__(FireRiskService)
            _fire_risk_service.model = None
            _fire_risk_service.preprocessor = None
            _fire_risk_service.features_list = []
    
    return _fire_risk_service
