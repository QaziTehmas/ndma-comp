import requests
import certifi
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import math

# Fix SSL certificate issue - use certifi bundle instead of PostgreSQL bundle
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
os.environ['SSL_CERT_FILE'] = certifi.where()

class WeatherService:
    """Service to fetch weather data from Open-Meteo API (historical and forecast)"""
    
    ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
    FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
    
    def __init__(self):
        pass
    
    def fetch_historical_weather(self, latitude: float, longitude: float, 
                                  year: int, month: int, day: int,
                                  raw_data: Optional[Dict] = None) -> Dict:
        """
        Fetch weather data for a specific date and calculate all required features.
        Uses archive API for past dates and forecast API for future dates.
        
        Args:
            latitude: Latitude of the location
            longitude: Longitude of the location
            year: Year
            month: Month (1-12)
            day: Day (1-31)
            
        Returns:
            Dictionary containing all weather features required by the model
        """
        target_date = datetime(year, month, day)
        today = datetime.now()
        today_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Determine if we're fetching historical or forecast data
        is_future = target_date > today_date
        
        # For historical data, check minimum year
        if not is_future and year < 1940:
            raise ValueError(f"Year {year} is too early. Historical weather data is typically available from 1940 onwards.")
        
        # For forecast, Open-Meteo typically provides up to 16 days ahead
        if is_future:
            max_forecast_date = today_date + timedelta(days=16)
            if target_date > max_forecast_date:
                # For dates beyond forecast range, use seasonal averages based on historical data
                print(f"Note: Date {target_date.strftime('%Y-%m-%d')} is beyond forecast range. Using seasonal estimates.")
        
        start_date = target_date - timedelta(days=7)  # Get 7 days before for averages
        
        # For future dates, adjust start_date to not go before today for forecast API
        if is_future and start_date < today_date:
            start_date = today_date
        
        # Ensure start_date is not before 1940 for historical
        if not is_future:
            earliest_date = datetime(1940, 1, 1)
            if start_date < earliest_date:
                start_date = earliest_date
                print(f"Warning: Adjusted start_date to {earliest_date.strftime('%Y-%m-%d')} (earliest available data)")
        
        # Fetch weather data for the target date and days before
        daily_params = [
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
        ]
        
        # Choose API based on date. Use Forecast API for future dates and recent dates (within 30 days)
        # to ensure real-time weather data is available and avoid archive latency/availability limits.
        days_diff = (today_date - target_date).days
        if is_future or days_diff <= 30:
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
            if raw_data is not None:
                data = raw_data
            else:
                response = requests.get(api_url, params=params, timeout=30)
                
                if response.status_code == 400:
                    error_detail = response.text
                    try:
                        error_json = response.json()
                        error_detail = error_json.get('reason', error_detail)
                    except:
                        pass
                    raise ValueError(f"Invalid API request: {error_detail}. Please check the date and location coordinates.")
                
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
            temp_max = daily_data["temperature_2m_max"][target_idx]
            temp_min = daily_data["temperature_2m_min"][target_idx]
            temp_mean = daily_data["temperature_2m_mean"][target_idx]
            precipitation_sum = daily_data["precipitation_sum"][target_idx] or 0.0
            rain_sum = daily_data["rain_sum"][target_idx] or 0.0
            precipitation_hours = daily_data["precipitation_hours"][target_idx] or 0
            windspeed_max = daily_data["windspeed_10m_max"][target_idx] or 0.0
            windgusts_max = daily_data["windgusts_10m_max"][target_idx] or 0.0
            evapotranspiration = daily_data["et0_fao_evapotranspiration"][target_idx] or 0.0
            weather_code = daily_data["weather_code"][target_idx] or 0
            
            # Helper function to safely calculate average
            def safe_avg(values, default):
                """Calculate average of values, handling None values"""
                valid_values = [v if v is not None else 0.0 for v in values]
                return sum(valid_values) / len(valid_values) if valid_values else default
            
            # Calculate 3-day and 7-day averages
            start_3day = max(0, target_idx - 2)
            start_7day = max(0, target_idx - 6)
            
            precipitation_sums = [daily_data["precipitation_sum"][i] or 0.0 for i in range(start_3day, target_idx + 1)]
            precipitation_sum_3day_avg = safe_avg(precipitation_sums, precipitation_sum)
            
            precipitation_sums_7 = [daily_data["precipitation_sum"][i] or 0.0 for i in range(start_7day, target_idx + 1)]
            precipitation_sum_7day_avg = safe_avg(precipitation_sums_7, precipitation_sum)
            
            rain_sums = [daily_data["rain_sum"][i] or 0.0 for i in range(start_3day, target_idx + 1)]
            rain_sum_3day_avg = safe_avg(rain_sums, rain_sum)
            
            rain_sums_7 = [daily_data["rain_sum"][i] or 0.0 for i in range(start_7day, target_idx + 1)]
            rain_sum_7day_avg = safe_avg(rain_sums_7, rain_sum)
            
            temp_means = [daily_data["temperature_2m_mean"][i] for i in range(start_3day, target_idx + 1) if daily_data["temperature_2m_mean"][i] is not None]
            temperature_mean_3day_avg = safe_avg(temp_means, temp_mean)
            
            temp_means_7 = [daily_data["temperature_2m_mean"][i] for i in range(start_7day, target_idx + 1) if daily_data["temperature_2m_mean"][i] is not None]
            temperature_mean_7day_avg = safe_avg(temp_means_7, temp_mean)
            
            # Calculate 7-day cumulative precipitation
            precipitation_cumsum_7day = sum(precipitation_sums_7)
            
            # Calculate temp_range
            temp_range = temp_max - temp_min
            
            # Calculate season
            if month in [12, 1, 2]:
                season = "Winter"
            elif month in [3, 4, 5]:
                season = "Spring"
            elif month in [6, 7, 8]:
                season = "Summer"
            else:
                season = "Autumn"
            
            # Calculate day_of_year
            day_of_year = target_date.timetuple().tm_yday
            
            # Calculate is_monsoon_season (monsoon months: June-September)
            is_monsoon_season = 1 if month in [6, 7, 8, 9] else 0
            
            # Calculate is_peak_rainy (peak rainy months: July-September)
            is_peak_rainy = 1 if month in [7, 8, 9] else 0
            
            # Calculate high_cumulative_precip (threshold ~100mm for 7-day cumulative)
            high_cumulative_precip = 1 if precipitation_cumsum_7day > 100 else 0
            
            return {
                "year": year,
                "month": month,
                "day": day,
                "latitude": latitude,
                "longitude": longitude,
                "temperature_max": float(temp_max),
                "temperature_min": float(temp_min),
                "temperature_mean": float(temp_mean),
                "precipitation_sum": float(precipitation_sum),
                "rain_sum": float(rain_sum),
                "precipitation_hours": int(precipitation_hours),
                "windspeed_max": float(windspeed_max),
                "windgusts_max": float(windgusts_max),
                "evapotranspiration": float(evapotranspiration),
                "weather_code": int(weather_code),
                "temp_range": float(temp_range),
                "precipitation_sum_3day_avg": float(precipitation_sum_3day_avg),
                "precipitation_sum_7day_avg": float(precipitation_sum_7day_avg),
                "rain_sum_3day_avg": float(rain_sum_3day_avg),
                "rain_sum_7day_avg": float(rain_sum_7day_avg),
                "temperature_mean_3day_avg": float(temperature_mean_3day_avg),
                "temperature_mean_7day_avg": float(temperature_mean_7day_avg),
                "precipitation_cumsum_7day": float(precipitation_cumsum_7day),
                "season": season,
                "day_of_year": int(day_of_year),
                "is_monsoon_season": is_monsoon_season,
                "is_peak_rainy": is_peak_rainy,
                "high_cumulative_precip": high_cumulative_precip
            }
            
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Failed to fetch weather data: {str(e)}")
        except (KeyError, IndexError, ValueError) as e:
            raise ValueError(f"Error processing weather data: {str(e)}")

# Singleton instance
_weather_service = None

def get_weather_service():
    """Get or create the singleton weather service instance."""
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service

