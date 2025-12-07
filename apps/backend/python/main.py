# ============================================================
# CRITICAL: Import sklearn patches BEFORE anything else
# ============================================================
# This MUST be the first import in the entire application
import sklearn_patches  # This applies all compatibility fixes

# ============================================================
# Now import everything else
# ============================================================
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from services.scraper import get_flood_data
from services.prediction_service import get_prediction_service
from services.weather_service import get_weather_service
# from services.pdf_generator import generate_pdf_report
import uvicorn

app = FastAPI(title="FloodWatch API", description="Backend for scraping river level data and flood prediction")

# CORS - Allow Frontend to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, verify specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simplified Pydantic model for flood prediction request
class FloodPredictionRequest(BaseModel):
    year: int
    month: int
    day: int
    location: str
    latitude: float
    longitude: float

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


# from pdf repo

# @app.get("/api/generate-report")
# def generate_report():
#     """
#     Generate comprehensive PDF report with all flood/weather data.
#     Returns PDF file for download.
#     """
#     # Get latest flood data
#     flood_data = get_flood_data()
#     
#     # Generate PDF
#     pdf_buffer = generate_pdf_report(flood_data)
#     
#     # Return as downloadable file
#     from datetime import datetime
#     filename = f"NDMA_Alert_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
#     
#     return StreamingResponse(
#         pdf_buffer,
#         media_type="application/pdf",
#         headers={
#             "Content-Disposition": f"attachment; filename={filename}"
#         }
#     )


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
            "message": "Model loaded and ready"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "hint": "Run 'python inspect_model.py' to check what's in the pickle file"
        }

@app.post("/api/flood-prediction")
def predict_flood(request: FloodPredictionRequest):
    """
    Predict flood probability based on location and date.
    Automatically fetches historical weather data and calculates all required features.
    
    Args:
        request: Contains year, month, day, location, latitude, longitude
        
    Returns:
        - flood_probability: Probability of flood (0-1)
        - flood_prediction: Binary prediction (0 or 1)
        - prediction_label: Human-readable prediction
        - probability_percentage: Probability as percentage
        - weather_data: The fetched weather data used for prediction
    """
    import traceback
    
    try:
        # Fetch historical weather data for the given location and date
        weather_service = get_weather_service()
        weather_data = weather_service.fetch_historical_weather(
            latitude=request.latitude,
            longitude=request.longitude,
            year=request.year,
            month=request.month,
            day=request.day
        )
        
        # Add location name to weather data
        weather_data["location"] = request.location
        
        # Make prediction using the fetched weather data
        prediction_service = get_prediction_service()
        result = prediction_service.predict(weather_data)
        
        # Include weather data in response for transparency
        result["weather_data"] = weather_data
        
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)