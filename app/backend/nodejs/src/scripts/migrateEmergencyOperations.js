import prisma from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '../../temp');

async function migrateActiveIncidents() {
  try {
    const filePath = path.join(TEMP_DIR, 'active-incidents.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`📋 Migrating ${data.length} active incidents...`);

    for (const incident of data) {
      await prisma.activeIncident.upsert({
        where: { id: incident.id },
        update: {
          type: incident.type,
          province: incident.province,
          district: incident.district,
          severity: incident.severity,
          status: incident.status,
          affected: incident.affected || 0,
          casualties: incident.casualties || 0,
          injured: incident.injured || 0,
          evacuated: incident.evacuated || 0,
          responseTeams: incident.responseTeams || 0,
          reliefCamps: incident.reliefCamps || 0,
          latitude: incident.latitude,
          longitude: incident.longitude,
          startDate: new Date(incident.startDate),
          lastUpdate: new Date(incident.lastUpdate),
          description: incident.description,
          incidentCommander: incident.incidentCommander,
          responseActions: incident.responseActions || [],
        },
        create: {
          id: incident.id,
          type: incident.type,
          province: incident.province,
          district: incident.district,
          severity: incident.severity,
          status: incident.status,
          affected: incident.affected || 0,
          casualties: incident.casualties || 0,
          injured: incident.injured || 0,
          evacuated: incident.evacuated || 0,
          responseTeams: incident.responseTeams || 0,
          reliefCamps: incident.reliefCamps || 0,
          latitude: incident.latitude,
          longitude: incident.longitude,
          startDate: new Date(incident.startDate),
          lastUpdate: new Date(incident.lastUpdate),
          description: incident.description,
          incidentCommander: incident.incidentCommander,
          responseActions: incident.responseActions || [],
        },
      });
    }

    console.log(`✅ Migrated ${data.length} active incidents`);
  } catch (error) {
    console.error('❌ Error migrating active incidents:', error);
    throw error;
  }
}

async function migrateResponseTeams() {
  try {
    const filePath = path.join(TEMP_DIR, 'response-teams.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`👥 Migrating ${data.length} response teams...`);

    for (const team of data) {
      await prisma.responseTeam.upsert({
        where: { id: team.id },
        update: {
          name: team.name,
          province: team.province,
          currentLocation: team.currentLocation,
          status: team.status,
          personnel: team.personnel,
          equipment: team.equipment || [],
          mission: team.mission,
          latitude: team.latitude,
          longitude: team.longitude,
        },
        create: {
          id: team.id,
          name: team.name,
          province: team.province,
          currentLocation: team.currentLocation,
          status: team.status,
          personnel: team.personnel,
          equipment: team.equipment || [],
          mission: team.mission,
          latitude: team.latitude,
          longitude: team.longitude,
        },
      });
    }

    console.log(`✅ Migrated ${data.length} response teams`);
  } catch (error) {
    console.error('❌ Error migrating response teams:', error);
    throw error;
  }
}

async function migrateProvincialVulnerabilities() {
  try {
    const filePath = path.join(TEMP_DIR, 'provincial-vulnerabilities.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`🗺️ Migrating ${data.length} provincial vulnerabilities...`);

    for (const vuln of data) {
      await prisma.provincialVulnerability.upsert({
        where: { province: vuln.province },
        update: {
          riskLevel: vuln.riskLevel,
          vulnerableDistricts: vuln.vulnerableDistricts,
          rainfallOutlook: vuln.rainfallOutlook,
          floodTypes: vuln.floodTypes || [],
          keyThreats: vuln.keyThreats || [],
          highRiskDistricts: vuln.highRiskDistricts || [],
          pdmaContact: vuln.pdmaContact || {},
        },
        create: {
          province: vuln.province,
          riskLevel: vuln.riskLevel,
          vulnerableDistricts: vuln.vulnerableDistricts,
          rainfallOutlook: vuln.rainfallOutlook,
          floodTypes: vuln.floodTypes || [],
          keyThreats: vuln.keyThreats || [],
          highRiskDistricts: vuln.highRiskDistricts || [],
          pdmaContact: vuln.pdmaContact || {},
        },
      });
    }

    console.log(`✅ Migrated ${data.length} provincial vulnerabilities`);
  } catch (error) {
    console.error('❌ Error migrating provincial vulnerabilities:', error);
    throw error;
  }
}

async function migrateNDMAWarehouses() {
  try {
    const filePath = path.join(TEMP_DIR, 'ndma-warehouses.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`🏭 Migrating ${data.length} NDMA warehouses...`);

    for (const warehouse of data) {
      await prisma.nDMAWarehouse.upsert({
        where: { id: warehouse.id },
        update: {
          name: warehouse.name,
          location: warehouse.location,
          type: warehouse.type,
          latitude: warehouse.latitude,
          longitude: warehouse.longitude,
          capacity: warehouse.capacity,
          currentStock: warehouse.currentStock || {},
        },
        create: {
          id: warehouse.id,
          name: warehouse.name,
          location: warehouse.location,
          type: warehouse.type,
          latitude: warehouse.latitude,
          longitude: warehouse.longitude,
          capacity: warehouse.capacity,
          currentStock: warehouse.currentStock || {},
        },
      });
    }

    console.log(`✅ Migrated ${data.length} NDMA warehouses`);
  } catch (error) {
    console.error('❌ Error migrating NDMA warehouses:', error);
    throw error;
  }
}

async function migrateHighRiskDistricts() {
  try {
    const filePath = path.join(TEMP_DIR, 'provincial-vulnerabilities.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`📍 Migrating high-risk districts...`);

    const districts = [];
    for (const vuln of data) {
      const floodTypes = vuln.floodTypes || [];
      const highRiskDistricts = vuln.highRiskDistricts || [];

      for (const district of highRiskDistricts) {
        // Determine primary flood type for this district
        // If multiple types, use the first one or most relevant
        const primaryFloodType = floodTypes[0] || 'Flash';
        
        districts.push({
          district,
          province: vuln.province,
          floodType: primaryFloodType,
          riskLevel: vuln.riskLevel === 'Very High' ? 'Very High' : 
                    vuln.riskLevel === 'High' ? 'High' : 'Medium',
          riskFactors: vuln.keyThreats || [],
          earlyWarningStatus: 'Active',
        });
      }
    }

    console.log(`📋 Found ${districts.length} high-risk districts to migrate...`);

    for (const district of districts) {
      await prisma.highRiskDistrict.upsert({
        where: {
          district_province: {
            district: district.district,
            province: district.province,
          },
        },
        update: {
          floodType: district.floodType,
          riskLevel: district.riskLevel,
          riskFactors: district.riskFactors,
          earlyWarningStatus: district.earlyWarningStatus,
        },
        create: {
          district: district.district,
          province: district.province,
          floodType: district.floodType,
          riskLevel: district.riskLevel,
          riskFactors: district.riskFactors,
          earlyWarningStatus: district.earlyWarningStatus,
        },
      });
    }

    console.log(`✅ Migrated ${districts.length} high-risk districts`);
  } catch (error) {
    console.error('❌ Error migrating high-risk districts:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Emergency Operations Data Migration...\n');

  try {
    await migrateActiveIncidents();
    await migrateResponseTeams();
    await migrateProvincialVulnerabilities();
    await migrateNDMAWarehouses();
    await migrateHighRiskDistricts();

    console.log('\n✅ Emergency Operations data migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

