# Thunder Client API Test Guide

## Base URL
```
http://localhost:8000
```

---

## 1. Health Check (Root Endpoint)
**Method:** `GET`  
**URL:** `http://localhost:8000/`  
**Headers:** None  
**Body:** None

**Expected Response:**
```json
{
  "status": "ok",
  "service": "FloodWatch Python Backend"
}
```

---

## 2. Check Flood Model Status
**Method:** `GET`  
**URL:** `http://localhost:8000/api/model-status`  
**Headers:** None  
**Body:** None

**Expected Response:**
```json
{
  "status": "ready",
  "model_type": "CatBoostClassifier",
  "has_predict": true,
  "has_predict_proba": true,
  "selected_features_count": <number>,
  "message": "CatBoost model loaded and ready"
}
```

---

## 3. Check Fire Model Status
**Method:** `GET`  
**URL:** `http://localhost:8000/api/fire-model-status`  
**Headers:** None  
**Body:** None

**Expected Response:**
```json
{
  "status": "ready",
  "model_type": "XGBoost",
  "features_count": <number>,
  "message": "Fire risk model loaded and ready"
}
```

---

## 4. Get Flood Data
**Method:** `GET`  
**URL:** `http://localhost:8000/api/flood-data`  
**Headers:** None  
**Body:** None

**Expected Response:** JSON with river/dam levels data

---

## 5. Chat Endpoint
**Method:** `GET`  
**URL:** `http://localhost:8000/api/chat?query=What are the historical flood patterns in Pakistan?`  
**Headers:** None  
**Body:** None

**Alternative Query Examples:**
- `http://localhost:8000/api/chat?query=Tell me about floods in Karachi`
- `http://localhost:8000/api/chat?query=What is the flood risk in Lahore?`
- `http://localhost:8000/api/chat?query=How many people were affected by floods in 2022?`

**Expected Response:**
```json
{
  "response": "<AI generated response>"
}
```

---

## 6. History Risk Analysis
**Method:** `GET`  
**URL:** `http://localhost:8000/api/history-risk?location=Karachi`  
**Headers:** None  
**Body:** None

**Alternative Location Examples:**
- `http://localhost:8000/api/history-risk?location=Lahore`
- `http://localhost:8000/api/history-risk?location=Islamabad`
- `http://localhost:8000/api/history-risk?location=Rawalpindi`

**Expected Response:**
```json
{
  "risk_analysis": "<Location risk summary>"
}
```

---

## 7. Flood Prediction
**Method:** `POST`  
**URL:** `http://localhost:8000/api/flood-prediction`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "year": 2025,
  "month": 7,
  "day": 15,
  "location": "Karachi",
  "latitude": 24.8607,
  "longitude": 67.0011
}
```

**Alternative Test Bodies:**

**Lahore:**
```json
{
  "year": 2025,
  "month": 8,
  "day": 10,
  "location": "Lahore",
  "latitude": 31.5497,
  "longitude": 74.3436
}
```

**Islamabad:**
```json
{
  "year": 2025,
  "month": 7,
  "day": 20,
  "location": "Islamabad",
  "latitude": 33.6844,
  "longitude": 73.0479
}
```

**Rawalpindi:**
```json
{
  "year": 2025,
  "month": 6,
  "day": 25,
  "location": "Rawalpindi",
  "latitude": 33.5651,
  "longitude": 73.0169
}
```

**Expected Response:**
```json
{
  "flood_probability": 0.45,
  "flood_prediction": 0,
  "prediction_label": "No Flood",
  "probability_percentage": 45.0,
  "weather_data": {
    "temperature_2m_max": 35.2,
    "temperature_2m_min": 28.5,
    "precipitation_sum": 12.5,
    "rain_sum": 10.2,
    "location": "Karachi",
    "location_flood_rate": 0.65
  },
  "flood_rate_info": {
    "location_flood_rate": 0.65,
    "location": "Karachi"
  }
}
```

---

## 8. Fire Risk Prediction
**Method:** `POST`  
**URL:** `http://localhost:8000/api/fire-prediction`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "year": 2025,
  "month": 5,
  "day": 15,
  "location": "Karachi",
  "latitude": 24.8607,
  "longitude": 67.0011
}
```

**Alternative Test Bodies:**

**Lahore (Summer):**
```json
{
  "year": 2025,
  "month": 6,
  "day": 20,
  "location": "Lahore",
  "latitude": 31.5497,
  "longitude": 74.3436
}
```

**Islamabad:**
```json
{
  "year": 2025,
  "month": 7,
  "day": 10,
  "location": "Islamabad",
  "latitude": 33.6844,
  "longitude": 73.0479
}
```

**Expected Response:**
```json
{
  "probability": 0.32,
  "fire_risk": false,
  "message": "Low fire risk",
  "risk_percentage": 32.0,
  "weather_data": {
    "temperature_2m_max": 38.5,
    "temperature_2m_min": 25.2,
    "precipitation_sum": 0.0,
    "relative_humidity_2m": 45.0,
    "wind_speed_10m": 15.5,
    "location": "Karachi"
  }
}
```

---

## Testing Order Recommendation

1. **Start with Health Check** (`GET /`) - Verify server is running
2. **Check Model Statuses** (`GET /api/model-status` and `GET /api/fire-model-status`) - Verify models are loaded
3. **Test Simple GET endpoints** (`GET /api/flood-data`, `GET /api/chat`, `GET /api/history-risk`)
4. **Test Prediction endpoints** (`POST /api/flood-prediction`, `POST /api/fire-prediction`)

---

## Common Issues & Troubleshooting

### If models are not loading:
- Check that model files exist in `apps/backend/python/model/` directory
- Verify the backend terminal shows no errors during startup
- Check that all dependencies are installed (`pip install -r requirements.txt`)

### If predictions fail:
- Verify coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- Check that the date is not too far in the future (weather API limitations)
- Ensure location name is provided as a string

### If chat endpoint fails:
- Check that the chat engine is properly initialized
- Verify environment variables are set (if required)

---

## Quick Copy-Paste for Thunder Client

### 1. Health Check
```
GET http://localhost:8000/
```

### 2. Flood Model Status
```
GET http://localhost:8000/api/model-status
```

### 3. Fire Model Status
```
GET http://localhost:8000/api/fire-model-status
```

### 4. Flood Data
```
GET http://localhost:8000/api/flood-data
```

### 5. Chat
```
GET http://localhost:8000/api/chat?query=What are the historical flood patterns in Pakistan?
```

### 6. History Risk
```
GET http://localhost:8000/api/history-risk?location=Karachi
```

### 7. Flood Prediction
```
POST http://localhost:8000/api/flood-prediction
Content-Type: application/json

{
  "year": 2025,
  "month": 7,
  "day": 15,
  "location": "Karachi",
  "latitude": 24.8607,
  "longitude": 67.0011
}
```

### 8. Fire Prediction
```
POST http://localhost:8000/api/fire-prediction
Content-Type: application/json

{
  "year": 2025,
  "month": 5,
  "day": 15,
  "location": "Karachi",
  "latitude": 24.8607,
  "longitude": 67.0011
}
```

