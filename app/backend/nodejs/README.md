# PDME Node.js Backend

Node.js backend API for PDME (Pakistan Disaster Management Ecosystem) platform.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL + TimescaleDB
- **Cache**: Redis (optional)
- **Validation**: Zod

## Setup

### 1. Install Dependencies

```bash
cd app/backend/nodejs
npm install
```

### 2. Set Up Database

1. Install PostgreSQL and TimescaleDB:
   ```bash
   # On macOS
   brew install postgresql
   brew install timescaledb
   
   # On Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo apt-get install timescaledb-2-postgresql-14
   ```

2. Create database:
   ```sql
   CREATE DATABASE pdme_db;
   \c pdme_db
   CREATE EXTENSION IF NOT EXISTS timescaledb;
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

### 3. Initialize Prisma

```bash
# Generate Prisma Client
npm run generate

# Create and run migrations
npm run migrate

# (Optional) Open Prisma Studio to view data
npm run studio
```

### 4. Migrate JSON Data

Migrate all JSON files from frontend to database:

```bash
npm run migrate:json
```

This will:
- Read all JSON files from `app/frontend/public/data/`
- Transform and insert data into PostgreSQL
- Handle duplicates and errors gracefully

### 5. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Disasters
- `GET /api/disasters/stats` - Overall disaster statistics
- `GET /api/disasters/floods` - Flood history with pagination
- `GET /api/disasters/floods/historical` - All historical floods
- `GET /api/disasters/earthquakes` - Earthquake history
- `GET /api/disasters/provincial-victims` - Provincial victim data
- `GET /api/disasters/:id` - Get specific disaster

### Weather
- `GET /api/weather` - Weather data with filters

### Predictions
- `GET /api/predictions` - Get stored predictions
- `POST /api/predictions` - Store new prediction

### Emergency
- `GET /api/emergency/contacts` - Emergency contacts

### Relief
- `GET /api/relief/stocks` - Relief stock inventory

## Project Structure

```
nodejs/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client
│   │   ├── redis.js           # Redis client
│   │   └── env.js             # Environment config
│   ├── routes/
│   │   └── api/               # API routes
│   ├── middleware/
│   │   └── errorHandler.js    # Error handling
│   ├── scripts/
│   │   └── migrateJSON.js     # JSON migration script
│   └── server.js               # Express app
├── .env.example               # Environment template
└── package.json
```

## Database Schema

See `prisma/schema.prisma` for full schema definition.

Main tables:
- `disasters` - Core disaster events
- `flood_events` - Flood-specific data
- `earthquake_events` - Earthquake-specific data
- `weather_data` - Time-series weather data
- `predictions` - ML model predictions
- `emergency_contacts` - Emergency contact information
- `relief_stocks` - Relief inventory
- `provincial_victims` - Provincial victim statistics
- `climate_data` - Climate trends
- `ndma_data` - NDMA vulnerability data

## Development

### Prisma Commands

```bash
# Create new migration
npm run migrate

# Generate Prisma Client
npm run generate

# Open Prisma Studio
npm run studio

# Deploy migrations (production)
npm run migrate:deploy
```

### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `REDIS_URL` - Redis connection string
- `PYTHON_BACKEND_URL` - Python ML backend URL
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

## Integration with Python Backend

The Node.js backend can proxy requests to the Python ML backend:

```javascript
// Example: Bridge service
const response = await fetch(`${PYTHON_BACKEND_URL}/api/flood-prediction`, {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## Caching

Redis is used for caching frequently accessed data:
- Disaster statistics (1 hour TTL)
- Emergency contacts (24 hour TTL)
- Weather data (30 minute TTL)

If Redis is not available, the API will work without caching.

## License

ISC

