"""
Database Service
Handles communication with Node.js backend to store predictions and weather data.
"""

import requests
import certifi
import os
from typing import Dict, Optional
from datetime import datetime
import traceback
from dotenv import load_dotenv

load_dotenv()

# Fix SSL certificate issue - use certifi bundle instead of PostgreSQL bundle
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
os.environ['SSL_CERT_FILE'] = certifi.where()

class DatabaseService:
    """
    Service to store predictions and weather data in PostgreSQL via Node.js API.
    """
    
    def __init__(self):
        self.nodejs_backend_url = os.getenv(
            'NODEJS_BACKEND_URL', 
            'http://localhost:3001'
        )
        self.enabled = os.getenv('ENABLE_DATABASE_STORAGE', 'true').lower() == 'true'
        
        if not self.enabled:
            print("⚠️ Database storage is disabled (ENABLE_DATABASE_STORAGE=false)")
    
    def _make_request(self, endpoint: str, data: Dict, method: str = 'POST') -> Optional[Dict]:
        """
        Make HTTP request to Node.js backend.
        
        Args:
            endpoint: API endpoint (e.g., '/api/predictions')
            data: Request body data
            method: HTTP method (default: 'POST')
            
        Returns:
            Response JSON or None if failed
        """
        if not self.enabled:
            return None
            
        try:
            url = f"{self.nodejs_backend_url}{endpoint}"
            response = requests.post(url, json=data, timeout=5)
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"⚠️ Database storage failed: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.ConnectionError:
            print(f"⚠️ Could not connect to Node.js backend at {self.nodejs_backend_url}")
            print("   Predictions will still work, but data won't be stored.")
            return None
        except requests.exceptions.Timeout:
            print(f"⚠️ Timeout connecting to Node.js backend")
            return None
        except Exception as e:
            print(f"⚠️ Error storing data in database: {e}")
            if os.getenv('DEBUG', 'false').lower() == 'true':
                traceback.print_exc()
            return None
    
    def store_weather_data(self, weather_data: Dict, location: str, 
                          latitude: float, longitude: float, 
                          date: datetime) -> Optional[Dict]:
        """
        Store weather data in database.
        
        Args:
            weather_data: Weather data dictionary from weather service
            location: Location name
            latitude: Latitude
            longitude: Longitude
            date: Date/time for the weather data
            
        Returns:
            Stored weather data record or None
        """
        # Extract relevant weather fields
        db_data = {
            'time': date.isoformat(),
            'location': location,
            'latitude': latitude,
            'longitude': longitude,
            'temperature': weather_data.get('temperature_mean'),
            'precipitation': weather_data.get('precipitation_sum'),
            'humidity': weather_data.get('relativehumidity_2m_mean'),
            'windSpeed': weather_data.get('windspeed_10m_max'),
            'pressure': weather_data.get('surface_pressure_mean'),
            'evapotranspiration': weather_data.get('et0_fao_evapotranspiration'),
        }
        
        return self._make_request('/api/weather', db_data)
    
    def store_prediction(self, prediction_type: str, location: str,
                        latitude: float, longitude: float,
                        prediction_date: datetime,
                        probability: float, prediction_value: Optional[int],
                        weather_data: Dict, features: Optional[Dict] = None,
                        model_version: Optional[str] = None) -> Optional[Dict]:
        """
        Store prediction in database.
        
        Args:
            prediction_type: 'flood' or 'fire'
            location: Location name
            latitude: Latitude
            longitude: Longitude
            prediction_date: Date for which prediction was made
            probability: Prediction probability (0-1)
            prediction_value: Binary prediction (0 or 1)
            weather_data: Weather data used for prediction
            features: Engineered features (optional)
            model_version: Model version identifier (optional)
            
        Returns:
            Stored prediction record or None
        """
        db_data = {
            'type': prediction_type,
            'location': location,
            'latitude': latitude,
            'longitude': longitude,
            'predictionDate': prediction_date.isoformat(),
            'probability': probability,
            'predictionValue': prediction_value,
            'modelVersion': model_version,
            'features': features,
            'weatherData': weather_data,
        }
        
        return self._make_request('/api/predictions', db_data)


# Singleton instance
_database_service = None

def get_database_service() -> DatabaseService:
    """Get or create the singleton database service instance."""
    global _database_service
    
    if _database_service is None:
        _database_service = DatabaseService()
    
    return _database_service

