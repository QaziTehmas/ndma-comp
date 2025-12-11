import express from 'express';
import prisma from '../../config/database.js';

const router = express.Router();

// Get weather data
router.get('/', async (req, res, next) => {
  try {
    const { location, startDate, endDate, limit = 100 } = req.query;

    const where = {};
    if (location) where.location = location;
    if (startDate || endDate) {
      where.time = {};
      if (startDate) where.time.gte = new Date(startDate);
      if (endDate) where.time.lte = new Date(endDate);
    }

    const weatherData = await prisma.weatherData.findMany({
      where,
      orderBy: {
        time: 'desc',
      },
      take: parseInt(limit),
    });

    res.json({ data: weatherData });
  } catch (error) {
    next(error);
  }
});

export default router;

