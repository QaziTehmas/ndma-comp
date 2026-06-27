"""
FloodWatch API Backend
Main FastAPI application for flood prediction, fire risk prediction, and related services.
Uses CatBoost/XGBoost models with OpenMeteo weather data.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from services.scraper import get_flood_data
from services.prediction_service import get_prediction_service
from services.weather_service import get_weather_service
from services.flood_rate_service import get_flood_rate_service
from services.fire_risk_service import get_fire_risk_service
from services.fire_weather_service import get_fire_weather_service
from services.database_service import get_database_service
import uvicorn
from dotenv import load_dotenv
import os
from services.chat_engine import chat_engine
from datetime import datetime

load_dotenv()

app = FastAPI(title="PDME API", description="Backend for flood prediction, fire risk, and disaster management")

# CORS - Allow Frontend to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, verify specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for requests
class FloodPredictionRequest(BaseModel):
    year: int
    month: int
    day: int
    location: str
    latitude: float
    longitude: float
    raw_weather_data: Optional[dict] = None

class FirePredictionRequest(BaseModel):
    year: int
    month: int
    day: int
    location: str
    latitude: float
    longitude: float
    raw_weather_data: Optional[dict] = None

@app.get("/")
def read_root():
    return {"status": "ok", "service": "FloodWatch Python Backend"}

@app.get("/api/flood-data")
def read_flood_data():
    """
    Returns the latest river/dam levels.
    Cached for 1 hour. Scrapes PDF if cache is old.
    """
    return get_flood_data()


@app.get("/api/chat")
def chat(query: str):
    """
    AI Analyst: Searches historical database for query.
    """
    print(f"📥 Received chat query: {query}")
    try:
        response = chat_engine.ask(query)
        print(f"📤 Sending response: {response[:100]}...")
        return {"response": response}
    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        return {"response": "I encountered an issue processing your question. Could you try rephrasing it?"}

@app.get("/api/history-risk")
def history_risk(location: str):
    """
    Returns historical risk context for a location.
    """
    risk_summary = chat_engine.get_location_summary(location)
    return {"risk_analysis": risk_summary}


@app.get("/api/model-status")
def get_model_status():
    """
    Check if the model is loaded and ready.
    """
    try:
        prediction_service = get_prediction_service()
        model = prediction_service.model
        if model is None:
            return {
                "status": "error",
                "message": "Model not loaded"
            }
        return {
            "status": "ready",
            "model_type": str(type(model).__name__),
            "has_predict": hasattr(model, 'predict'),
            "has_predict_proba": hasattr(model, 'predict_proba'),
            "selected_features_count": len(prediction_service.selected_features),
            "message": "CatBoost model loaded and ready"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/flood-prediction")
def predict_flood(request: FloodPredictionRequest):
    """
    Predict flood probability based on location and date.
    
    Process:
    1. Fetch historical weather data from OpenMeteo API
    2. Get location_flood_rate from flood_rate.json via reverse geocoding
    3. Perform feature engineering
    4. Make prediction using CatBoost model
    
    Args:
        request: Contains year, month, day, location, latitude, longitude
        
    Returns:
        - flood_probability: Probability of flood (0-1)
        - flood_prediction: Binary prediction (0 or 1)
        - prediction_label: Human-readable prediction
        - probability_percentage: Probability as percentage
        - weather_data: The fetched weather data used for prediction
        - flood_rate_info: Location flood rate details
    """
    import traceback
    import json
    
    try:
        # Print request body for debugging
        request_dict = {
            "year": request.year,
            "month": request.month,
            "day": request.day,
            "location": request.location,
            "latitude": request.latitude,
            "longitude": request.longitude
        }
        print(f"📥 Flood Prediction Request Body:")
        print(json.dumps(request_dict, indent=2))
        # 1. Fetch historical weather data for the given location and date
        weather_service = get_weather_service()
        weather_data = weather_service.fetch_historical_weather(
            latitude=request.latitude,
            longitude=request.longitude,
            year=request.year,
            month=request.month,
            day=request.day,
            raw_data=request.raw_weather_data
        )
        
        # Add location name to weather data
        weather_data["location"] = request.location
        
        # 2. Get location_flood_rate from flood_rate.json
        flood_rate_service = get_flood_rate_service()
        flood_rate_info = flood_rate_service.get_location_flood_rate(
            latitude=request.latitude,
            longitude=request.longitude,
            location_name=request.location
        )
        
        # Add location_flood_rate to weather_data for prediction
        weather_data["location_flood_rate"] = flood_rate_info["location_flood_rate"]
        
        # 3. Make prediction using the fetched weather data
        prediction_service = get_prediction_service()
        result = prediction_service.predict(weather_data)
        
        # 4. Store in database (non-blocking, errors won't break prediction)
        try:
            db_service = get_database_service()
            prediction_date = datetime(request.year, request.month, request.day)
            
            # Store weather data
            db_service.store_weather_data(
                weather_data=weather_data,
                location=request.location,
                latitude=request.latitude,
                longitude=request.longitude,
                date=prediction_date
            )
            
            # Store prediction
            db_service.store_prediction(
                prediction_type='flood',
                location=request.location,
                latitude=request.latitude,
                longitude=request.longitude,
                prediction_date=prediction_date,
                probability=result['flood_probability'],
                prediction_value=result['flood_prediction'],
                weather_data=weather_data,
                features=weather_data,  # Store all features
                model_version='flood_prediction_model_improved.pkl'
            )
        except Exception as db_error:
            # Log but don't fail the prediction
            print(f"⚠️ Database storage error (prediction still successful): {db_error}")
        
        # 5. Include weather data and flood rate info in response for transparency
        result["weather_data"] = weather_data
        result["flood_rate_info"] = flood_rate_info
        
        return result
        
    except ValueError as e:
        error_msg = str(e)
        print(f"ValueError in prediction: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    except FileNotFoundError as e:
        error_msg = f"Model file not found: {str(e)}"
        print(f"FileNotFoundError: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Prediction error: {str(e)}"
        print(f"Exception in prediction: {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/flood-prediction/current")
def predict_flood_current(request: FloodPredictionRequest):
    """
    Predict flood probability for current date using the selected location.
    
    Args:
        request: Contains location, latitude, longitude (year/month/day are ignored, uses today)
        
    Returns:
        Same as /api/flood-prediction but for current date
    """
    from datetime import datetime
    import traceback
    import json
    
    try:
        # Print request body for debugging
        request_dict = {
            "year": request.year,
            "month": request.month,
            "day": request.day,
            "location": request.location,
            "latitude": request.latitude,
            "longitude": request.longitude,
            "note": "Using current date (year/month/day ignored)"
        }
        print(f"📥 Flood Prediction (Current) Request Body:")
        print(json.dumps(request_dict, indent=2))
        today = datetime.now()
        
        # 1. Fetch current weather data
        weather_service = get_weather_service()
        weather_data = weather_service.fetch_historical_weather(
            latitude=request.latitude,
            longitude=request.longitude,
            year=today.year,
            month=today.month,
            day=today.day,
            raw_data=request.raw_weather_data
        )
        
        # Add location name to weather data
        weather_data["location"] = request.location
        
        # 2. Get location_flood_rate from flood_rate.json
        flood_rate_service = get_flood_rate_service()
        flood_rate_info = flood_rate_service.get_location_flood_rate(
            latitude=request.latitude,
            longitude=request.longitude,
            location_name=request.location
        )
        
        # Add location_flood_rate to weather_data for prediction
        weather_data["location_flood_rate"] = flood_rate_info["location_flood_rate"]
        
        # 3. Make prediction using the fetched weather data
        prediction_service = get_prediction_service()
        result = prediction_service.predict(weather_data)
        
        # 4. Store in database (non-blocking, errors won't break prediction)
        try:
            db_service = get_database_service()
            prediction_date = datetime(today.year, today.month, today.day)
            
            # Store weather data
            db_service.store_weather_data(
                weather_data=weather_data,
                location=request.location,
                latitude=request.latitude,
                longitude=request.longitude,
                date=prediction_date
            )
            
            # Store prediction
            db_service.store_prediction(
                prediction_type='flood',
                location=request.location,
                latitude=request.latitude,
                longitude=request.longitude,
                prediction_date=prediction_date,
                probability=result['flood_probability'],
                prediction_value=result['flood_prediction'],
                weather_data=weather_data,
                features=weather_data,  # Store all features
                model_version='flood_prediction_model_improved.pkl'
            )
        except Exception as db_error:
            # Log but don't fail the prediction
            print(f"⚠️ Database storage error (prediction still successful): {db_error}")
        
        # 5. Include weather data and flood rate info in response
        result["weather_data"] = weather_data
        result["flood_rate_info"] = flood_rate_info
        result["is_current"] = True
        
        return result
        
    except ValueError as e:
        error_msg = str(e)
        print(f"ValueError in current flood prediction: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    except FileNotFoundError as e:
        error_msg = f"Model file not found: {str(e)}"
        print(f"FileNotFoundError: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Prediction error: {str(e)}"
        print(f"Exception in current flood prediction: {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/fire-prediction")
def predict_fire(request: FirePredictionRequest):
    """
    Predict fire risk based on location and date.
    
    Process:
    1. Fetch weather data from OpenMeteo API
    2. Convert units (Celsius, km/h, mm -> Fahrenheit, mph, inches)
    3. Perform feature engineering
    4. Make prediction using XGBoost model
    
    Args:
        request: Contains year, month, day, location, latitude, longitude
        
    Returns:
        - probability: Fire risk probability (0-1)
        - fire_risk: Boolean indicating high risk
        - message: Human-readable risk level
        - risk_percentage: Probability as percentage
        - weather_data: The fetched weather data used for prediction
    """
    import traceback
    import json
    
    try:
        # Print request body for debugging
        request_dict = {
            "year": request.year,
            "month": request.month,
            "day": request.day,
            "location": request.location,
            "latitude": request.latitude,
            "longitude": request.longitude
        }
        print(f"📥 Fire Prediction Request Body:")
        print(json.dumps(request_dict, indent=2))
        # 1. Fetch weather data for fire prediction
        fire_weather_service = get_fire_weather_service()
        weather_data = fire_weather_service.fetch_fire_weather(
            latitude=request.latitude,
            longitude=request.longitude,
            year=request.year,
            month=request.month,
            day=request.day,
            raw_data=request.raw_weather_data
        )
        
        # Add location name to weather data
        weather_data["location"] = request.location
        
        # 2. Make prediction using fire risk service
        fire_risk_service = get_fire_risk_service()
        result = fire_risk_service.predict(weather_data)
        
        # 3. Store in database (non-blocking, errors won't break prediction)
        try:
            db_service = get_database_service()
            prediction_date = datetime(request.year, request.month, request.day)
            
            # Store weather data (convert fire weather format to standard format)
            weather_for_db = {
                'temperature_mean': weather_data.get('MAX_TEMP'),  # Use max temp as mean
                'precipitation_sum': weather_data.get('PRECIPITATION'),
                'relativehumidity_2m_mean': None,  # Fire weather doesn't include humidity
                'windspeed_10m_max': weather_data.get('AVG_WIND_SPEED'),
                'surface_pressure_mean': None,  # Fire weather doesn't include pressure
                'et0_fao_evapotranspiration': None,  # Fire weather doesn't include evapotranspiration
            }
            
            db_service.store_weather_data(
                weather_data=weather_for_db,
                location=request.location,
                latitude=request.latitude,
                longitude=request.longitude,
                date=prediction_date
            )
            
            # Store prediction
            db_service.store_prediction(
                prediction_type='fire',
                location=request.location,
                latitude=request.latitude,
                longitude=request.longitude,
                prediction_date=prediction_date,
                probability=result['probability'],
                prediction_value=1 if result['fire_risk'] else 0,
                weather_data=weather_data,
                features=weather_data,  # Store all features
                model_version='xgb_wildfire_model.json'
            )
        except Exception as db_error:
            # Log but don't fail the prediction
            print(f"⚠️ Database storage error (prediction still successful): {db_error}")
        
        # 4. Include weather data in response for transparency
        result["weather_data"] = weather_data
        
        return result
        
    except ValueError as e:
        error_msg = str(e)
        print(f"ValueError in fire prediction: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    except FileNotFoundError as e:
        error_msg = f"Fire model file not found: {str(e)}"
        print(f"FileNotFoundError: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Fire prediction error: {str(e)}"
        print(f"Exception in fire prediction: {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/fire-prediction/current")
def predict_fire_current(request: FirePredictionRequest):
    """
    Predict fire risk for current date using the selected location.
    
    Args:
        request: Contains location, latitude, longitude (year/month/day are ignored, uses today)
        
    Returns:
        Same as /api/fire-prediction but for current date
    """
    from datetime import datetime
    import traceback
    import json
    
    try:
        # Print request body for debugging
        request_dict = {
            "year": request.year,
            "month": request.month,
            "day": request.day,
            "location": request.location,
            "latitude": request.latitude,
            "longitude": request.longitude,
            "note": "Using current date (year/month/day ignored)"
        }
        print(f"📥 Fire Prediction (Current) Request Body:")
        print(json.dumps(request_dict, indent=2))
        today = datetime.now()
        
        # 1. Fetch current weather data for fire prediction
        fire_weather_service = get_fire_weather_service()
        weather_data = fire_weather_service.fetch_fire_weather(
            latitude=request.latitude,
            longitude=request.longitude,
            year=today.year,
            month=today.month,
            day=today.day,
            raw_data=request.raw_weather_data
        )
        
        # Add location name to weather data
        weather_data["location"] = request.location
        
        # 2. Make prediction using fire risk service
        fire_risk_service = get_fire_risk_service()
        result = fire_risk_service.predict(weather_data)
        
        # 3. Store in database (non-blocking, errors won't break prediction)
        try:
            db_service = get_database_service()
            prediction_date = datetime(today.year, today.month, today.day)
            
            # Store weather data (convert fire weather format to standard format)
            weather_for_db = {
                'temperature_mean': weather_data.get('MAX_TEMP'),  # Use max temp as mean
                'precipitation_sum': weather_data.get('PRECIPITATION'),
                'relativehumidity_2m_mean': None,  # Fire weather doesn't include humidity
                'windspeed_10m_max': weather_data.get('AVG_WIND_SPEED'),
                'surface_pressure_mean': None,  # Fire weather doesn't include pressure
                'et0_fao_evapotranspiration': None,  # Fire weather doesn't include evapotranspiration
            }
            
            db_service.store_weather_data(
                weather_data=weather_for_db,
                location=request.location,
                latitude=request.latitude,
                longitude=request.longitude,
                date=prediction_date
            )
            
            # Store prediction
            db_service.store_prediction(
                prediction_type='fire',
                location=request.location,
                latitude=request.latitude,
                longitude=request.longitude,
                prediction_date=prediction_date,
                probability=result['probability'],
                prediction_value=1 if result['fire_risk'] else 0,
                weather_data=weather_data,
                features=weather_data,  # Store all features
                model_version='xgb_wildfire_model.json'
            )
        except Exception as db_error:
            # Log but don't fail the prediction
            print(f"⚠️ Database storage error (prediction still successful): {db_error}")
        
        # 4. Include weather data in response
        result["weather_data"] = weather_data
        result["is_current"] = True
        
        return result
        
    except ValueError as e:
        error_msg = str(e)
        print(f"ValueError in current fire prediction: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    except FileNotFoundError as e:
        error_msg = f"Fire model file not found: {str(e)}"
        print(f"FileNotFoundError: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Fire prediction error: {str(e)}"
        print(f"Exception in current fire prediction: {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/api/fire-model-status")
def get_fire_model_status():
    """Check if the fire risk model is loaded and ready."""
    try:
        fire_risk_service = get_fire_risk_service()
        if fire_risk_service.model is None:
            return {
                "status": "error",
                "message": "Fire risk model not loaded"
            }
        return {
            "status": "ready",
            "model_type": "XGBoost",
            "features_count": len(fire_risk_service.features_list),
            "message": "Fire risk model loaded and ready"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)