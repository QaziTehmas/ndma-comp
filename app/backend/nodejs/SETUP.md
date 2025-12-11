# Setup Guide - PDME Node.js Backend

## Prerequisites

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **PostgreSQL** (v14 or higher)
   ```bash
   psql --version  # Should be v14+
   ```

3. **TimescaleDB Extension** (optional but recommended)
   ```bash
   # On macOS
   brew install timescaledb
   
   # On Ubuntu/Debian
   sudo apt-get install timescaledb-2-postgresql-14
   ```

4. **Redis** (optional, for caching)
   ```bash
   # On macOS
   brew install redis
   
   # On Ubuntu/Debian
   sudo apt-get install redis-server
   ```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd app/backend/nodejs
npm install
```

### 2. Set Up PostgreSQL Database

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pdme_db;

# Connect to the database
\c pdme_db

# Enable TimescaleDB extension (if installed)
CREATE EXTENSION IF NOT EXISTS timescaledb;

# Exit psql
\q
```

#### Update Database URL

Edit `app/backend/nodejs/.env`:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/pdme_db?schema=public"
```

Replace:
- `YOUR_USERNAME` with your PostgreSQL username (usually `postgres`)
- `YOUR_PASSWORD` with your PostgreSQL password

### 3. Initialize Prisma

```bash
cd app/backend/nodejs

# Generate Prisma Client
npm run generate

# Create and run database migrations
npm run migrate
```

This will:
- Create all tables in the database
- Set up relationships
- Create indexes

### 4. Migrate JSON Data

Migrate all JSON files from frontend to database:

```bash
npm run migrate:json
```

This script will:
- Read JSON files from `app/frontend/public/data/`
- Transform data to match database schema
- Insert data into PostgreSQL
- Handle duplicates gracefully

**Expected output:**
```
🚀 Starting JSON to Database Migration...
✅ Database connected

📊 Migrating disaster-stats.json...
✅ Disaster stats loaded (aggregate data)
🌊 Migrating flood-history.json...
✅ Migrated 4 flood events
📜 Migrating historical-floods.json...
✅ Migrated 50+ historical floods
👥 Migrating provincial-victims.json...
✅ Migrated 84 provincial victim records
📞 Migrating emergency-contacts.json...
✅ Migrated 20+ emergency contacts
📦 Migrating relief-stocks.json...
✅ Migrated 10+ relief stock items
🌡️  Migrating climate-data.json...
✅ Migrated 100+ climate data records
🏛️  Migrating ndma-data.json...
✅ Migrated 10+ NDMA data records

✅ Migration completed successfully!
```

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3001`

### 6. Verify Installation

#### Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "PDME Node.js Backend",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### Test API Endpoints

```bash
# Get disaster statistics
curl http://localhost:3001/api/disasters/stats

# Get flood history
curl http://localhost:3001/api/disasters/floods?limit=10

# Get emergency contacts
curl http://localhost:3001/api/emergency/contacts
```

## Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL in `.env` is correct
3. Check PostgreSQL credentials

### Prisma Migration Error

**Error:** `Migration failed`

**Solution:**
1. Check database exists:
   ```sql
   \l  -- List databases
   ```

2. Reset migrations (development only):
   ```bash
   npx prisma migrate reset
   npm run migrate
   ```

### JSON Migration Errors

**Error:** `Error reading file`

**Solution:**
1. Verify JSON files exist in `app/frontend/public/data/`
2. Check file permissions
3. Verify JSON syntax is valid

### Port Already in Use

**Error:** `Port 3001 is already in use`

**Solution:**
1. Change PORT in `.env`:
   ```env
   PORT=3002
   ```

2. Or kill the process using port 3001:
   ```bash
   # macOS/Linux
   lsof -ti:3001 | xargs kill
   ```

## Next Steps

1. **View Data in Prisma Studio:**
   ```bash
   npm run studio
   ```

2. **Update Frontend:**
   - Replace JSON fetches with API calls
   - Update `dataLoader.js` to use new endpoints

3. **Add Caching:**
   - Set up Redis (optional)
   - Update `.env` with Redis URL

4. **Integrate Python Backend:**
   - Ensure Python backend is running on port 8000
   - Test prediction endpoints

## Development Workflow

1. **Make Schema Changes:**
   ```bash
   # Edit prisma/schema.prisma
   # Then run:
   npm run migrate
   npm run generate
   ```

2. **Add New Endpoints:**
   - Create route in `src/routes/api/`
   - Add to `src/server.js`

3. **Test Changes:**
   ```bash
   npm run dev  # Auto-reloads on changes
   ```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Run migrations:
   ```bash
   npm run migrate:deploy
   ```
3. Start server with PM2 or similar:
   ```bash
   pm2 start src/server.js --name pdme-backend
   ```

## Support

For issues or questions:
1. Check logs in console
2. Verify database connection
3. Check Prisma Studio for data integrity
4. Review API endpoint responses

