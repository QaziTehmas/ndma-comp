import express from 'express';
import prisma from '../../config/database.js';
import { getCache, setCache } from '../../config/redis.js';

const router = express.Router();

// Get overall disaster statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Try cache first
    const cacheKey = 'disaster:stats';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Aggregate from database
    const stats = await prisma.disaster.aggregate({
      _count: { id: true },
      _sum: {
        deaths: true,
        affected: true,
        economicLossUsd: true,
      },
    });

    // Get disaster types breakdown
    const disasterTypes = await prisma.disaster.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    // Get disasters by year
    const disastersByYear = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM event_date)::INTEGER as year,
        COUNT(*)::INTEGER as count
      FROM disasters
      GROUP BY EXTRACT(YEAR FROM event_date)
      ORDER BY year DESC
    `;

    const result = {
      total_disasters: stats._count.id || 0,
      total_deaths: stats._sum.deaths || 0,
      total_affected: stats._sum.affected || 0,
      economic_loss_usd: stats._sum.economicLossUsd || 0,
      disaster_types: disasterTypes.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {}),
      disasters_by_year: disastersByYear,
    };

    // Cache for 1 hour
    await setCache(cacheKey, result, 3600);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get flood history
router.get('/floods', async (req, res, next) => {
  try {
    const { limit = 100, offset = 0, province, year } = req.query;

    const where = {
      type: 'flood',
      ...(province && { province }),
      ...(year && {
        eventDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      }),
    };

    const [floods, total] = await Promise.all([
      prisma.disaster.findMany({
        where,
        include: {
          floodEvent: true,
        },
        orderBy: {
          eventDate: 'desc',
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.disaster.count({ where }),
    ]);

    res.json({
      data: floods,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

// Get historical floods (all time)
router.get('/floods/historical', async (req, res, next) => {
  try {
    const { limit = 1000, offset = 0 } = req.query;

    const floods = await prisma.disaster.findMany({
      where: {
        type: 'flood',
      },
      include: {
        floodEvent: true,
      },
      orderBy: {
        eventDate: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.json({
      data: floods,
      total: floods.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get earthquake history
router.get('/earthquakes', async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const earthquakes = await prisma.disaster.findMany({
      where: {
        type: 'earthquake',
      },
      include: {
        earthquakeEvent: true,
      },
      orderBy: {
        eventDate: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.json({
      data: earthquakes,
      total: earthquakes.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get provincial victims data
router.get('/provincial-victims', async (req, res, next) => {
  try {
    const { province, year } = req.query;

    const where = {};
    if (province) where.province = province;
    if (year) where.year = parseInt(year);

    const victims = await prisma.provincialVictim.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { province: 'asc' },
      ],
    });

    res.json({ data: victims });
  } catch (error) {
    next(error);
  }
});

// Get disaster by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const disaster = await prisma.disaster.findUnique({
      where: { id: parseInt(id) },
      include: {
        floodEvent: true,
        earthquakeEvent: true,
      },
    });

    if (!disaster) {
      return res.status(404).json({ error: 'Disaster not found' });
    }

    res.json(disaster);
  } catch (error) {
    next(error);
  }
});

export default router;

