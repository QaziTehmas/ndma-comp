# Pakistan Disaster Management Ecosystem (PDME)

Pakistan Disaster Management Ecosystem (PDME) is a comprehensive, multi-tiered digital platform engineered for real-time disaster monitoring, AI-powered flood forecasting, weather intelligence, and community-driven incident reporting. Designed specifically to enhance emergency response and resource allocation across Pakistan, the system integrates advanced mapping services, machine learning models, and automated river/reservoir analysis.

![PDME Dashboard Demo](./demo.webp)

---

## Table of Contents
1. [Overview & Key Features](#overview--key-features)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Prerequisites](#prerequisites)
5. [Database Setup Options](#database-setup-options)
   - [Option A: Local PostgreSQL Setup](#option-a-local-postgresql-setup)
   - [Option B: Neon Cloud PostgreSQL Setup](#option-b-neon-cloud-postgresql-setup)
6. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
   - [1. Node.js Backend API](#1-nodejs-backend-api)
   - [2. Python ML & Prediction Backend](#2-python-ml--prediction-backend)
   - [3. React Web Frontend](#3-react-web-frontend)
7. [Environment Variables Reference](#environment-variables-reference)
   - [Node.js Backend Env](#nodejs-backend-env-appbackendnodejsenv)
   - [Python Backend Env](#python-backend-env-appbackendpythonenv)
   - [React Frontend Env](#react-frontend-env-appfrontendenv)
8. [Running the Application (Local Development)](#running-the-application-local-development)
9. [Data Seeding & Migration](#data-seeding--migration)
10. [Important Architecture & Deployment Notes](#important-architecture--deployment-notes)
    - [Open-Meteo API Rate Limiting (Client-Side Weather Proxy)](#1-open-meteo-api-rate-limiting-client-side-weather-proxy)
    - [Vercel SPA Routing Configuration](#2-vercel-spa-routing-configuration)
    - [Windows Encoding & SSL Configuration](#3-windows-encoding--ssl-configuration)

---

## Overview & Key Features

* **AI-Powered Predictions**: Leverages trained **CatBoost** and **XGBoost** machine learning models to forecast flood risks and evaluate forest fire probabilities based on meteorological inputs.
* **Interactive Mapping (GIS)**: Fully integrated with **ArcGIS Maps SDK** and **Leaflet** to provide interactive, geospatial maps displaying emergency operations centers, historical disaster epicenters, and regional risk alerts.
* **Real-time River & Dam Monitoring**: Automatically parses and visualizes water levels from key reservoirs (Tarbela, Mangla, etc.) utilizing scraper pipelines.
* **Bilingual AI Chatbot Analyst**: Embedded assistant powered by Google's **Gemini API** that allows administrators and public safety users to query database metrics, obtain risk contexts, and view structured responses.
* **Community Report Board**: A crowd-sourced channel allowing citizens to post active flood warnings, road closures, or hazard alerts, which are cataloged in the database.
* **Emergency Operations Control**: Consolidates active relief resources, deaths, affected citizens, and economic impact logs across Pakistani provinces (Punjab, Sindh, KPK, Balochistan, Gilgit-Baltistan, AJK).

---

## Technology Stack

### Frontend App
* React 19 (Vite 7/8 build system)
* React Router 7
* Tailwind CSS (PostCSS)
* Chart.js & Recharts (data plotting)
* ArcGIS Maps SDK & Leaflet

### Node.js Backend Service
* Node.js (ES Modules syntax)
* Express.js
* Prisma ORM
* PostgreSQL (Neon database integration)
* Redis (performance cache)
* Zod (runtime validation)

### Python Engine
* Python 3.10+
* FastAPI & Uvicorn
* Google GenerativeAI (Gemini SDK)
* Scikit-Learn, CatBoost, XGBoost, Pandas, NumPy
* pdfplumber (automated parsing of river level PDF circulars)

---

## Project Architecture

```
ndma-comp/ (Root)
├── demo.webp               # Visual demo asset
└── app/
    ├── backend/
    │   ├── nodejs/         # Core API & database handler (Express, Prisma)
    │   │   ├── prisma/     # DB schema and local migrations
    │   │   └── src/        # Server scripts, controllers, routes
    │   └── python/         # ML prediction & AI chatbot engine (FastAPI)
    │       ├── model/      # XGBoost/CatBoost models (.pkl)
    │       └── services/   # Prediction & GenAI services
    └── frontend/           # React dashboard UI (Vite)
        └── src/
            ├── components/ # Interactive UI modules
            ├── config/     # Endpoint environment mappings
            └── pages/      # Router pages (History, Dashboard, Relief)
```

---

## Prerequisites

Ensure you have the following software installed locally:
1. **Node.js** (v18.0.0 or higher) & **npm** (v9.0.0 or higher)
2. **Python** (v3.10 or higher)
3. **PostgreSQL** instance (local server or cloud service like Neon.tech)
4. **Git** (for version control)

---

## Database Setup Options

PDME uses PostgreSQL to store disaster reports, operations centers, and prediction histories. You can configure either a local PostgreSQL installation or a cloud database instance on Neon.

### Option A: Local PostgreSQL Setup

1. **Install PostgreSQL**: Download and run the installer for your OS from the [official PostgreSQL downloads page](https://www.postgresql.org/download/).
2. **Create Database**: Open pgAdmin, dBeaver, or command line `psql` and create a blank database:
   ```sql
   CREATE DATABASE pdme_db;
   ```
3. **Obtain Connection String**:
   Your local database connection string will look like this:
   ```
   DATABASE_URL="postgresql://[DB_USER]:[DB_PASSWORD]@localhost:5432/pdme_db?schema=public"
   ```
   *Replace `[DB_USER]` (default is `postgres`) and `[DB_PASSWORD]` with your credentials.*

---

### Option B: Neon Cloud PostgreSQL Setup

1. **Create Account**: Register for a free tier database at [Neon.tech](https://neon.tech/).
2. **Create Project**: Initialize a new project and select the PostgreSQL version.
3. **Obtain Connection String**:
   Copy the connection string from the Neon dashboard. It will look like this:
   ```
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@ep-autumn-wind-at1r544a-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

---

## Step-by-Step Setup Guide

Follow this order of execution to set up and run the codebase locally:

### 1. Node.js Backend API

1. Navigate to the Node.js backend directory:
   ```bash
   cd app/backend/nodejs
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file in `app/backend/nodejs/.env` (see the [Environment Variables Reference](#nodejs-backend-env-appbackendnodejsenv) below).
4. Run the database migrations to build your schema:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with historical logs, operation centers, and warehouse profiles:
   ```bash
   npm run seed
   npm run migrate:emergency
   ```
6. Start the Express development server on port `3001`:
   ```bash
   npm run dev
   ```

---

### 2. Python ML & Prediction Backend

1. Navigate to the Python backend directory:
   ```bash
   cd ../python
   ```
2. Create and activate a virtual environment:
   * **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Create your `.env` file in `app/backend/python/.env` (see [Python Backend Env](#python-backend-env-appbackendpythonenv)).
5. Start the FastAPI microservice on port `8000`:
   * **Windows Terminal (fixes emoji/Unicode errors)**:
     ```powershell
     $env:PYTHONIOENCODING="utf-8"
     python main.py
     ```
   * **macOS/Linux**:
     ```bash
     python main.py
     ```

---

### 3. React Web Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../../frontend
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file in `app/frontend/.env` (see [React Frontend Env](#react-frontend-env-appfrontendenv)).
4. Launch the local Vite dev server on port `5173`:
   ```bash
   npm run dev
   ```
5. Access the user interface via `http://localhost:5173` in your web browser.

---

## Environment Variables Reference

Make sure to create `.env` files in all three locations with the following structures:

### Node.js Backend Env (`app/backend/nodejs/.env`)
```env
# PostgreSQL Database URL (Neon Cloud or Local Postgres instance)
DATABASE_URL="postgresql://neondb_owner:npg_95pRbemGrfPB@ep-autumn-wind-at1r544a-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Python prediction engine location
PYTHON_BACKEND_URL="http://localhost:8000"

```

### Python Backend Env (`app/backend/python/.env`)
```env
# Google Gemini API key used for the chatbot analyst queries
GEMINI_API_KEY="AIzaSyDEnpmU3l_YourAPIKeyGoesHere"

```

### React Frontend Env (`app/frontend/.env`)
```env
# Frontend API integrations pointing to backend services
# If you deploy to production, replace these with your hosted links
VITE_PYTHON_BACKEND_URL="http://localhost:8000"
VITE_NODEJS_API_BASE="http://localhost:3001"
```

---

## Running the Application (Concurrently)

To run all services concurrently in development mode, open three terminal windows:

| Service | Directory | Port | Command |
| :--- | :--- | :--- | :--- |
| **Python Backend** | `app/backend/python` | `8000` | `$env:PYTHONIOENCODING="utf-8"; python main.py` |
| **Node.js API** | `app/backend/nodejs` | `3001` | `npm run dev` |
| **React Frontend** | `app/frontend` | `5173` | `npm run dev` |

---

## Data Seeding & Migration

The Node.js backend includes scripts to load mock datasets for testing:
* **Import Historical Disaster Logs**: Parses standard incident profiles and inserts them into your Database.
  ```bash
  npm run seed
  ```
* **Import Emergency Operations Centers**: Populates coordinates for relief hubs, response teams, and warehouses.
  ```bash
  npm run migrate:emergency
  ```

---

## Important Architecture & Deployment Notes

### 1. Open-Meteo API Rate Limiting (Client-Side Weather Proxy)
To prevent your hosted Python backend on Render from running into `429 Too Many Requests` rate limiting errors (caused by multiple developers sharing Render's outbound NAT IP address block), this project routes weather queries through a **Client-Side Weather Proxy**:
* **How it works**: The user's **web browser (frontend)** directly calls `api.open-meteo.com` using the user's home or mobile IP address.
* **Payload Transmission**: The frontend attaches this raw weather JSON payload to the prediction request body under `raw_weather_data`.
* **Execution**: The Python backend checks if `raw_weather_data` is sent from the frontend. Since it is, the backend **bypasses** the internal `requests.get()` code block entirely and parses your frontend-supplied data directly.
* **Fallback**: If the browser's request fails (due to adblockers, browser extensions, or connection issues), the Python backend will automatically fallback to fetching the data from the server itself.

### 2. Vercel SPA Routing Configuration
To prevent `404 Page Not Found` errors when reloading direct dashboard routes on Vercel, the [vercel.json](app/frontend/vercel.json) file redirects all incoming traffic to the root index:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 3. Windows Encoding & SSL Configuration
* **SSL Certificates**: Python might experience SSL certificate validation issues on Windows when downloading river level data. This is bypassed automatically in `weather_service.py` and `fire_weather_service.py` by mapping `REQUESTS_CA_BUNDLE` and `SSL_CERT_FILE` directly to the `certifi.where()` bundle.
* **Console Output Encoding**: Running the server in standard Windows PowerShell can fail to print console logs containing emoji indicators (e.g. `⚠️` or `✅`) due to the terminal default encoding `cp1252`. Always launch using `$env:PYTHONIOENCODING="utf-8"` to prevent `UnicodeEncodeError` exceptions.
