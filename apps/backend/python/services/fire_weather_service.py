"""
Fire Weather Service
Fetches weather data from OpenMeteo API for fire risk prediction.
Calculates the specific parameters needed by the fire risk model.
"""

import requests
from datetime import datetime, timedelta
from typing import Dict

class FireWeatherService:
    """Service to fetch weather data from OpenMeteo for fire risk prediction"""
    
    ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
    FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
    
    def __init__(self):
        pass
    
    def fetch_fire_weather(self, latitude: float, longitude: float,
                           year: int, month: int, day: int) -> Dict:
        """
        Fetch weather data for fire risk prediction.
        
        The fire model needs:
        - MAX_TEMP: Maximum temperature (Celsius)
        - MIN_TEMP: Minimum temperature (Celsius)
        - AVG_WIND_SPEED: Average wind speed (mph - model expects mph)
        - PRECIPITATION: Precipitation (inches - model expects inches)
        - LAGGED_PRECIPITATION: Yesterday's precipitation (inches)
        - LAGGED_AVG_WIND_SPEED: Yesterday's wind speed (mph)
        
        Args:
            latitude: Latitude of the location
            longitude: Longitude of the location
            year: Year
            month: Month (1-12)
            day: Day (1-31)
            
        Returns:
            Dictionary containing all weather features required by the fire model
        """
        target_date = datetime(year, month, day)
        today = datetime.now()
        today_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Determine if we're fetching historical or forecast data
        is_future = target_date > today_date
        
        # Get yesterday's date for lagged values
        yesterday = target_date - timedelta(days=1)
        
        # Need 2 days of data: yesterday and target date
        start_date = yesterday
        
        # For future dates beyond forecast, adjust
        if is_future and start_date < today_date:
            start_date = today_date
        
        # Daily weather parameters needed
        daily_params = [
            "temperature_2m_max",
            "temperature_2m_min",
            "windspeed_10m_max",
            "windspeed_10m_mean",
            "precipitation_sum"
        ]
        
        # Choose API based on date
        if is_future:
            api_url = self.FORECAST_URL
        else:
            api_url = self.ARCHIVE_URL
        
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": target_date.strftime("%Y-%m-%d"),
            "daily": ",".join(daily_params),
            "timezone": "auto"
        }
        
        try:
            response = requests.get(api_url, params=params, timeout=30)
            
            if response.status_code == 400:
                error_detail = response.text
                try:
                    error_json = response.json()
                    error_detail = error_json.get('reason', error_detail)
                except:
                    pass
                raise ValueError(f"Invalid API request: {error_detail}")
            
            response.raise_for_status()
            data = response.json()
            
            if not data.get("daily"):
                raise ValueError("No daily weather data received from API")
            
            daily_data = data["daily"]
            dates = daily_data.get("time", [])
            
            # Find the target date index
            target_date_str = target_date.strftime("%Y-%m-%d")
            try:
                target_idx = dates.index(target_date_str)
            except ValueError:
                raise ValueError(f"Target date {target_date_str} not found in weather data")
            
            # Extract target date data
            temp_max = daily_data["temperature_2m_max"][target_idx] or 0.0
            temp_min = daily_data["temperature_2m_min"][target_idx] or 0.0
            
            # Wind speed - OpenMeteo returns km/h, convert to mph (model expects mph)
            wind_max = daily_data["windspeed_10m_max"][target_idx] or 0.0
            wind_mean = daily_data.get("windspeed_10m_mean", [None])[target_idx]
            if wind_mean is None:
                wind_mean = wind_max * 0.6  # Estimate average from max
            
            # Convert km/h to mph (1 km/h = 0.621371 mph)
            avg_wind_speed_mph = wind_mean * 0.621371
            
            # Precipitation - OpenMeteo returns mm, convert to inches (model expects inches)
            precipitation_mm = daily_data["precipitation_sum"][target_idx] or 0.0
            precipitation_in = precipitation_mm * 0.0393701  # mm to inches
            
            # Get lagged (yesterday's) values
            yesterday_str = yesterday.strftime("%Y-%m-%d")
            if yesterday_str in dates:
                yesterday_idx = dates.index(yesterday_str)
                lagged_precip_mm = daily_data["precipitation_sum"][yesterday_idx] or 0.0
                lagged_precip_in = lagged_precip_mm * 0.0393701
                
                lagged_wind = daily_data.get("windspeed_10m_mean", [None])[yesterday_idx]
                if lagged_wind is None:
                    lagged_wind = (daily_data["windspeed_10m_max"][yesterday_idx] or 0.0) * 0.6
                lagged_wind_mph = lagged_wind * 0.621371
            else:
                # Yesterday not in data, use today's values as estimate
                lagged_precip_in = precipitation_in
                lagged_wind_mph = avg_wind_speed_mph
            
            return {
                "date": target_date_str,
                "year": year,
                "month": month,
                "day": day,
                "latitude": latitude,
                "longitude": longitude,
                "MAX_TEMP": float(temp_max),
                "MIN_TEMP": float(temp_min),
                "AVG_WIND_SPEED": float(avg_wind_speed_mph),
                "PRECIPITATION": float(precipitation_in),
                "LAGGED_PRECIPITATION": float(lagged_precip_in),
                "LAGGED_AVG_WIND_SPEED": float(lagged_wind_mph),
                # Include raw values for display
                "temperature_max_c": float(temp_max),
                "temperature_min_c": float(temp_min),
                "wind_speed_kmh": float(wind_mean),
                "precipitation_mm": float(precipitation_mm)
            }
            
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Failed to fetch weather data: {str(e)}")
        except (KeyError, IndexError, ValueError) as e:
            raise ValueError(f"Error processing weather data: {str(e)}")


# Singleton instance
_fire_weather_service = None

def get_fire_weather_service() -> FireWeatherService:
    """Get or create the singleton fire weather service instance."""
    global _fire_weather_service
    if _fire_weather_service is None:
        _fire_weather_service = FireWeatherService()
    return _fire_weather_service
