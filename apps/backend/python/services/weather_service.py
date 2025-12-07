import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import math

class WeatherService:
    """Service to fetch historical weather data from Open-Meteo API"""
    
    BASE_URL = "https://archive-api.open-meteo.com/v1/archive"
    
    def __init__(self):
        pass
    
    def fetch_historical_weather(self, latitude: float, longitude: float, 
                                  year: int, month: int, day: int) -> Dict:
        """
        Fetch historical weather data for a specific date and calculate all required features.
        
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
        
        # Check if date is in the future
        if target_date > today:
            raise ValueError(f"Date {target_date.strftime('%Y-%m-%d')} is in the future. Historical weather data is only available for past dates.")
        
        # Open-Meteo archive API typically has data back to 1940, but let's check
        if year < 1940:
            raise ValueError(f"Year {year} is too early. Historical weather data is typically available from 1940 onwards.")
        
        start_date = target_date - timedelta(days=7)  # Get 7 days before for averages
        
        # Ensure start_date is not before 1940
        earliest_date = datetime(1940, 1, 1)
        if start_date < earliest_date:
            start_date = earliest_date
            print(f"Warning: Adjusted start_date to {earliest_date.strftime('%Y-%m-%d')} (earliest available data)")
        
        # Fetch weather data for the target date and 7 days before
        # Open-Meteo API requires daily parameters as comma-separated string
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
        
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": target_date.strftime("%Y-%m-%d"),
            "daily": ",".join(daily_params),
            "timezone": "auto"
        }
        
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=30)
            
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
                "day_of_year": int(day_of_year)
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

