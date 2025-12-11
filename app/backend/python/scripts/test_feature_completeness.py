"""
Test script to verify all features are present in the data flow.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.weather_service import get_weather_service
from services.fire_weather_service import get_fire_weather_service
from services.prediction_service import get_prediction_service
from services.fire_risk_service import get_fire_risk_service
from datetime import datetime
import pandas as pd

print("=" * 80)
print("FEATURE COMPLETENESS TEST")
print("=" * 80)

# Test location
lat, lon = 33.6844, 73.0479  # Islamabad
today = datetime.now()

print("\n🌊 TESTING FLOOD MODEL FEATURES:")
print("-" * 80)

# Get flood weather data
weather_service = get_weather_service()
flood_weather = weather_service.fetch_historical_weather(lat, lon, today.year, today.month, today.day)
print(f"✓ Weather service returned {len(flood_weather)} fields")

# Add location_flood_rate (normally done in main.py)
flood_weather["location_flood_rate"] = 0.1  # Mock value

# Test feature engineering
prediction_service = get_prediction_service()
flood_df = pd.DataFrame([flood_weather])
flood_df = prediction_service.perform_feature_engineering(flood_df)

print(f"✓ After feature engineering: {len(flood_df.columns)} columns")

# Check required features
missing_flood = [f for f in prediction_service.selected_features if f not in flood_df.columns]
if missing_flood:
    print(f"❌ MISSING FLOOD FEATURES: {missing_flood}")
else:
    print(f"✅ All {len(prediction_service.selected_features)} flood features present!")

print("\n🔥 TESTING FIRE MODEL FEATURES:")
print("-" * 80)

# Get fire weather data
fire_weather_service = get_fire_weather_service()
fire_weather = fire_weather_service.fetch_fire_weather(lat, lon, today.year, today.month, today.day)
print(f"✓ Fire weather service returned {len(fire_weather)} fields")

# Test feature engineering
fire_risk_service = get_fire_risk_service()
fire_df = pd.DataFrame([fire_weather])
date_str = f"{today.year}-{today.month:02d}-{today.day:02d}"
fire_df = fire_risk_service.perform_feature_engineering(fire_df, date_str)

print(f"✓ After feature engineering: {len(fire_df.columns)} columns")

# Check required features
missing_fire = [f for f in fire_risk_service.features_list if f not in fire_df.columns]
if missing_fire:
    print(f"❌ MISSING FIRE FEATURES: {missing_fire}")
else:
    print(f"✅ All {len(fire_risk_service.features_list)} fire features present!")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)

