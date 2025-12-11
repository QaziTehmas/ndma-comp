import express from 'express';
import prisma from '../../config/database.js';

const router = express.Router();

// Helper function to check if error is a database connection error
const isDatabaseConnectionError = (error) => {
  return error?.code === 'P1001' || 
         error?.message?.includes('Can\'t reach database server') ||
         error?.message?.includes('connect ECONNREFUSED');
};

// Get active incidents
router.get('/incidents', async (req, res, next) => {
  try {
    const { province, type, status, severity } = req.query;

    const where = {};
    if (province) where.province = province;
    if (type) where.type = type;
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const incidents = await prisma.activeIncident.findMany({
      where,
      orderBy: {
        lastUpdate: 'desc',
      },
    });

    res.json({ data: incidents });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.warn('Database connection error, returning empty data:', error.message);
      return res.json({ data: [] });
    }
    next(error);
  }
});

// Get single incident by ID
router.get('/incidents/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await prisma.activeIncident.findUnique({
      where: { id },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json({ data: incident });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.warn('Database connection error:', error.message);
      return res.status(503).json({ error: 'Database unavailable. Please start PostgreSQL service.' });
    }
    next(error);
  }
});

// Get response teams
router.get('/response-teams', async (req, res, next) => {
  try {
    const { province, status, location } = req.query;

    const where = {};
    if (province) where.province = province;
    if (status) where.status = status;
    if (location) where.currentLocation = location;

    const teams = await prisma.responseTeam.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { province: 'asc' },
      ],
    });

    res.json({ data: teams });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.warn('Database connection error, returning empty data:', error.message);
      return res.json({ data: [] });
    }
    next(error);
  }
});

// Get provincial vulnerabilities
router.get('/provincial-vulnerabilities', async (req, res, next) => {
  try {
    const { province } = req.query;

    const where = {};
    if (province) where.province = province;

    const vulnerabilities = await prisma.provincialVulnerability.findMany({
      where,
      orderBy: {
        province: 'asc',
      },
    });

    res.json({ data: vulnerabilities });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.warn('Database connection error, returning empty data:', error.message);
      return res.json({ data: [] });
    }
    next(error);
  }
});

// Get NDMA warehouses
router.get('/warehouses', async (req, res, next) => {
  try {
    const { location, type } = req.query;

    const where = {};
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (type) where.type = type;

    const warehouses = await prisma.nDMAWarehouse.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    res.json({ data: warehouses });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.warn('Database connection error, returning empty data:', error.message);
      return res.json({ data: [] });
    }
    next(error);
  }
});

// Get high-risk districts
router.get('/high-risk-districts', async (req, res, next) => {
  try {
    const { province, floodType, riskLevel } = req.query;

    const where = {};
    if (province) where.province = province;
    if (floodType) where.floodType = floodType;
    if (riskLevel) where.riskLevel = riskLevel;

    const districts = await prisma.highRiskDistrict.findMany({
      where,
      orderBy: [
        { riskLevel: 'desc' },
        { province: 'asc' },
        { district: 'asc' },
      ],
    });

    res.json({ data: districts });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.warn('Database connection error, returning empty data:', error.message);
      return res.json({ data: [] });
    }
    next(error);
  }
});

// Get emergency operations dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      activeIncidentsCount,
      responseTeamsCount,
      reliefCampsCount,
      totalEvacuated,
      incidents,
    ] = await Promise.all([
      prisma.activeIncident.count({
        where: { status: 'Active' },
      }),
      prisma.responseTeam.count({
        where: { status: { in: ['Deployed', 'Active'] } },
      }),
      prisma.activeIncident.aggregate({
        where: { status: 'Active' },
        _sum: { reliefCamps: true },
      }),
      prisma.activeIncident.aggregate({
        where: { status: 'Active' },
        _sum: { evacuated: true },
      }),
      prisma.activeIncident.findMany({
        where: { status: 'Active' },
        select: { reliefCamps: true, evacuated: true },
      }),
    ]);

    // Calculate total relief camps and evacuated from all incidents
    const totalReliefCamps = incidents.reduce((sum, inc) => sum + (inc.reliefCamps || 0), 0);
    const totalEvacuatedPeople = incidents.reduce((sum, inc) => sum + (inc.evacuated || 0), 0);

    res.json({
      data: {
        activeIncidents: activeIncidentsCount,
        responseTeamsDeployed: responseTeamsCount,
        reliefCampsOperational: totalReliefCamps,
        peopleEvacuated: totalEvacuatedPeople,
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.warn('Database connection error, returning empty stats:', error.message);
      return res.json({
        data: {
          activeIncidents: 0,
          responseTeamsDeployed: 0,
          reliefCampsOperational: 0,
          peopleEvacuated: 0,
        },
      });
    }
    next(error);
  }
});

// Get all data for map view
router.get('/map-data', async (req, res, next) => {
  try {
    const [incidents, teams, warehouses] = await Promise.all([
      prisma.activeIncident.findMany({
        where: { status: { in: ['Active', 'Monitoring'] } },
        select: {
          id: true,
          type: true,
          province: true,
          district: true,
          severity: true,
          latitude: true,
          longitude: true,
          affected: true,
          casualties: true,
        },
      }),
      prisma.responseTeam.findMany({
        where: { status: { in: ['Deployed', 'Active'] } },
        select: {
          id: true,
          name: true,
          province: true,
          currentLocation: true,
          status: true,
          latitude: true,
          longitude: true,
          personnel: true,
        },
      }),
      prisma.nDMAWarehouse.findMany({
        select: {
          id: true,
          name: true,
          location: true,
          type: true,
          latitude: true,
          longitude: true,
        },
      }),
    ]);

    res.json({
      data: {
        incidents: incidents.map((inc) => ({
          ...inc,
          markerType: 'incident',
        })),
        responseTeams: teams.map((team) => ({
          ...team,
          markerType: 'responseTeam',
        })),
        warehouses: warehouses.map((wh) => ({
          ...wh,
          markerType: 'warehouse',
        })),
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.warn('Database connection error, returning empty map data:', error.message);
      return res.json({
        data: {
          incidents: [],
          responseTeams: [],
          warehouses: [],
        },
      });
    }
    next(error);
  }
});

export default router;

