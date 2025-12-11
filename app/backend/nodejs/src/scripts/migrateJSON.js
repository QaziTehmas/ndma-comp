/**
 * JSON to Database Migration Script
 * Migrates all JSON files from frontend/public/data to PostgreSQL database
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to frontend public data directory
// From: app/backend/nodejs/src/scripts/migrateJSON.js
// To: app/frontend/public/data
// Go up 4 levels: scripts -> src -> nodejs -> backend -> root
const DATA_DIR = join(__dirname, '../../../../frontend/public/data');

/**
 * Read and parse JSON file
 */
async function readJSONFile(filename) {
  try {
    const filePath = join(DATA_DIR, filename);
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    return null;
  }
}

/**
 * Migrate disaster-stats.json
 */
async function migrateDisasterStats() {
  console.log('📊 Migrating disaster-stats.json...');
  const data = await readJSONFile('disaster-stats.json');
  if (!data) return;

  // This is aggregate data, we'll store it as metadata
  // The actual disasters should come from flood-history.json and historical-floods.json
  console.log('✅ Disaster stats loaded (aggregate data)');
  return data;
}

/**
 * Migrate flood-history.json
 */
async function migrateFloodHistory() {
  console.log('🌊 Migrating flood-history.json...');
  const data = await readJSONFile('flood-history.json');
  if (!data) return;

  let count = 0;
  const events = Array.isArray(data) ? data : (data.major_events || data.events || data.data || []);

  for (const event of events) {
    try {
      // Parse date from year and month
      let eventDate = new Date();
      if (event.year) {
        const month = event.month || 'January';
        const monthMap = {
          'January': 0, 'February': 1, 'March': 2, 'April': 3,
          'May': 4, 'June': 5, 'July': 6, 'August': 7,
          'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        const monthNum = monthMap[month] || 0;
        eventDate = new Date(event.year, monthNum, 1);
      }

      // Create disaster record
      const disaster = await prisma.disaster.create({
        data: {
          type: 'flood',
          eventDate: eventDate,
          location: event.region || event.location || event.area || null,
          latitude: event.latitude ? parseFloat(event.latitude) : null,
          longitude: event.longitude ? parseFloat(event.longitude) : null,
          severity: event.severity || null,
          deaths: event.deaths ? parseInt(event.deaths) : null,
          affected: event.affected ? parseInt(event.affected) : null,
          economicLossUsd: event.economic_loss_usd ? BigInt(event.economic_loss_usd) : null,
          province: event.region || event.province || null,
          description: event.description || event.type || null,
        },
      });

      // Create flood event
      await prisma.floodEvent.create({
        data: {
          disasterId: disaster.id,
          waterLevel: event.water_level ? parseFloat(event.water_level) : null,
          damLevels: event.dam_levels || null,
          affectedAreas: event.affected_areas || (event.region ? [event.region] : []),
          riverName: event.river || null,
          floodRate: event.flood_rate ? parseFloat(event.flood_rate) : null,
        },
      });

      count++;
    } catch (error) {
      console.error(`❌ Error migrating flood event:`, error.message);
    }
  }

  console.log(`✅ Migrated ${count} flood events`);
  return count;
}

/**
 * Migrate historical-floods.json
 */
async function migrateHistoricalFloods() {
  console.log('📜 Migrating historical-floods.json...');
  const data = await readJSONFile('historical-floods.json');
  if (!data) return;

  let count = 0;
  const floods = Array.isArray(data) ? data : (data.floods || data.data || []);

  for (const flood of floods) {
    try {
      // Check if disaster already exists (by date and location)
      const existing = await prisma.disaster.findFirst({
        where: {
          type: 'flood',
          eventDate: flood.year ? new Date(`${flood.year}-01-01`) : new Date(),
          location: flood.location || null,
        },
      });

      if (existing) {
        // Update existing record
        await prisma.disaster.update({
          where: { id: existing.id },
          data: {
            deaths: flood.deaths ? parseInt(flood.deaths) : existing.deaths,
            affected: flood.affected ? parseInt(flood.affected) : existing.affected,
            economicLossUsd: flood.economic_loss ? BigInt(flood.economic_loss) : existing.economicLossUsd,
            province: flood.province || existing.province,
            description: flood.description || flood.details || existing.description,
          },
        });
        count++;
        continue;
      }

      // Create new disaster record
      const disaster = await prisma.disaster.create({
        data: {
          type: 'flood',
          eventDate: flood.year ? new Date(`${flood.year}-01-01`) : new Date(),
          location: flood.location || flood.area || null,
          latitude: flood.latitude ? parseFloat(flood.latitude) : null,
          longitude: flood.longitude ? parseFloat(flood.longitude) : null,
          severity: flood.severity || null,
          deaths: flood.deaths ? parseInt(flood.deaths) : null,
          affected: flood.affected ? parseInt(flood.affected) : null,
          economicLossUsd: flood.economic_loss ? BigInt(flood.economic_loss) : null,
          province: flood.province || null,
          description: flood.description || flood.details || null,
        },
      });

      // Create flood event
      await prisma.floodEvent.create({
        data: {
          disasterId: disaster.id,
          waterLevel: flood.water_level ? parseFloat(flood.water_level) : null,
          damLevels: flood.dam_levels || null,
          affectedAreas: flood.affected_areas || [],
          riverName: flood.river || null,
          floodRate: flood.flood_rate ? parseFloat(flood.flood_rate) : null,
        },
      });

      count++;
    } catch (error) {
      console.error(`❌ Error migrating historical flood:`, error.message);
    }
  }

  console.log(`✅ Migrated ${count} historical floods`);
  return count;
}

/**
 * Migrate provincial-victims.json
 */
async function migrateProvincialVictims() {
  console.log('👥 Migrating provincial-victims.json...');
  const data = await readJSONFile('provincial-victims.json');
  if (!data) return;

  let count = 0;

  // Handle nested structure: {period: "2009-2022", provinces: {...}}
  if (data.provinces) {
    // Extract year range from period (e.g., "2009-2022")
    const period = data.period || '2009-2022';
    const [startYear, endYear] = period.split('-').map(y => parseInt(y));

    for (const [province, stats] of Object.entries(data.provinces)) {
      // Create records for each year in the range
      for (let year = startYear; year <= endYear; year++) {
        try {
          // Distribute stats across years (simple average)
          const totalYears = endYear - startYear + 1;
          const yearlyDeaths = stats.deaths ? Math.floor(stats.deaths / totalYears) : null;
          const yearlyAffected = stats.total_affected ? Math.floor(stats.total_affected / totalYears) : null;

          await prisma.provincialVictim.upsert({
            where: {
              province_year: {
                province: province,
                year: year,
              },
            },
            update: {
              deaths: yearlyDeaths,
              affected: yearlyAffected,
              displaced: null,
              economicLoss: null,
            },
            create: {
              province: province,
              year: year,
              deaths: yearlyDeaths,
              affected: yearlyAffected,
              displaced: null,
              economicLoss: null,
            },
          });

          count++;
        } catch (error) {
          if (error.code !== 'P2002') {
            console.error(`❌ Error migrating provincial victim:`, error.message);
          }
        }
      }
    }
  } else {
    // Handle array format (fallback)
    const victims = Array.isArray(data) ? data : (data.victims || data.data || []);

    for (const victim of victims) {
      try {
        await prisma.provincialVictim.upsert({
          where: {
            province_year: {
              province: victim.province,
              year: parseInt(victim.year),
            },
          },
          update: {
            deaths: victim.deaths ? parseInt(victim.deaths) : null,
            affected: victim.affected ? parseInt(victim.affected) : null,
            displaced: victim.displaced ? parseInt(victim.displaced) : null,
            economicLoss: victim.economic_loss ? BigInt(victim.economic_loss) : null,
          },
          create: {
            province: victim.province,
            year: parseInt(victim.year),
            deaths: victim.deaths ? parseInt(victim.deaths) : null,
            affected: victim.affected ? parseInt(victim.affected) : null,
            displaced: victim.displaced ? parseInt(victim.displaced) : null,
            economicLoss: victim.economic_loss ? BigInt(victim.economic_loss) : null,
          },
        });

        count++;
      } catch (error) {
        console.error(`❌ Error migrating provincial victim:`, error.message);
      }
    }
  }

  console.log(`✅ Migrated ${count} provincial victim records`);
  return count;
}

/**
 * Migrate emergency-contacts.json
 */
async function migrateEmergencyContacts() {
  console.log('📞 Migrating emergency-contacts.json...');
  const data = await readJSONFile('emergency-contacts.json');
  if (!data) return;

  let count = 0;

  // Handle nested structure: {national: {...}, provincial: {...}}
  if (data.national) {
    for (const [key, value] of Object.entries(data.national)) {
      try {
        await prisma.emergencyContact.create({
          data: {
            organization: key.replace(/_/g, ' '),
            province: null,
            phone: typeof value === 'string' ? value : null,
            email: null,
            category: 'national',
            address: null,
          },
        });
        count++;
      } catch (error) {
        if (error.code !== 'P2002') {
          console.error(`❌ Error migrating national contact:`, error.message);
        }
      }
    }
  }

  // Handle provincial contacts
  if (data.provincial) {
    for (const [province, contacts] of Object.entries(data.provincial)) {
      if (typeof contacts === 'object') {
        for (const [key, value] of Object.entries(contacts)) {
          try {
            await prisma.emergencyContact.create({
              data: {
                organization: key.replace(/_/g, ' '),
                province: province,
                phone: typeof value === 'string' ? value : null,
                email: null,
                category: 'provincial',
                address: null,
              },
            });
            count++;
          } catch (error) {
            if (error.code !== 'P2002') {
              console.error(`❌ Error migrating provincial contact:`, error.message);
            }
          }
        }
      }
    }
  }

  // Handle array format (fallback)
  if (Array.isArray(data)) {
    for (const contact of data) {
      try {
        await prisma.emergencyContact.create({
          data: {
            organization: contact.organization || contact.name || 'Unknown',
            province: contact.province || null,
            phone: contact.phone || contact.contact || null,
            email: contact.email || null,
            category: contact.category || contact.type || null,
            address: contact.address || null,
          },
        });
        count++;
      } catch (error) {
        if (error.code !== 'P2002') {
          console.error(`❌ Error migrating emergency contact:`, error.message);
        }
      }
    }
  }

  console.log(`✅ Migrated ${count} emergency contacts`);
  return count;
}

/**
 * Migrate relief-stocks.json
 */
async function migrateReliefStocks() {
  console.log('📦 Migrating relief-stocks.json...');
  const data = await readJSONFile('relief-stocks.json');
  if (!data) return;

  let count = 0;
  const stocks = Array.isArray(data) ? data : (data.stocks || data.data || []);

  for (const stock of stocks) {
    try {
      await prisma.reliefStock.create({
        data: {
          item: stock.item || stock.name || 'Unknown',
          quantity: stock.quantity ? parseInt(stock.quantity) : 0,
          unit: stock.unit || null,
          location: stock.location || null,
          province: stock.province || null,
          lastUpdated: stock.last_updated ? new Date(stock.last_updated) : new Date(),
        },
      });

      count++;
    } catch (error) {
      console.error(`❌ Error migrating relief stock:`, error.message);
    }
  }

  console.log(`✅ Migrated ${count} relief stock items`);
  return count;
}

/**
 * Migrate climate-data.json
 */
async function migrateClimateData() {
  console.log('🌡️  Migrating climate-data.json...');
  const data = await readJSONFile('climate-data.json');
  if (!data) return;

  let count = 0;
  const climateData = Array.isArray(data) ? data : (data.data || []);

  for (const record of climateData) {
    try {
      await prisma.climateData.create({
        data: {
          year: parseInt(record.year),
          month: record.month ? parseInt(record.month) : null,
          province: record.province || null,
          temperature: record.temperature ? parseFloat(record.temperature) : null,
          precipitation: record.precipitation ? parseFloat(record.precipitation) : null,
          humidity: record.humidity ? parseFloat(record.humidity) : null,
          trend: record.trend || null,
        },
      });

      count++;
    } catch (error) {
      console.error(`❌ Error migrating climate data:`, error.message);
    }
  }

  console.log(`✅ Migrated ${count} climate data records`);
  return count;
}

/**
 * Migrate ndma-data.json
 */
async function migrateNDMAData() {
  console.log('🏛️  Migrating ndma-data.json...');
  const data = await readJSONFile('ndma-data.json');
  if (!data) return;

  let count = 0;
  const ndmaData = Array.isArray(data) ? data : (data.data || []);

  for (const record of ndmaData) {
    try {
      await prisma.nDMAData.create({
        data: {
          province: record.province || null,
          district: record.district || null,
          vulnerabilityLevel: record.vulnerability_level || record.vulnerability || null,
          alertLevel: record.alert_level || record.alert || null,
          riskFactors: record.risk_factors || record.risks || null,
        },
      });

      count++;
    } catch (error) {
      console.error(`❌ Error migrating NDMA data:`, error.message);
    }
  }

  console.log(`✅ Migrated ${count} NDMA data records`);
  return count;
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting JSON to Database Migration...\n');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // Run migrations
    await migrateDisasterStats();
    await migrateFloodHistory();
    await migrateHistoricalFloods();
    await migrateProvincialVictims();
    await migrateEmergencyContacts();
    await migrateReliefStocks();
    await migrateClimateData();
    await migrateNDMAData();

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main();

