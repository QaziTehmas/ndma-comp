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

// Store weather data (called from Python backend)
router.post('/', async (req, res, next) => {
  try {
    const {
      time,
      location,
      latitude,
      longitude,
      temperature,
      precipitation,
      humidity,
      windSpeed,
      pressure,
      evapotranspiration,
    } = req.body;

    const weatherData = await prisma.weatherData.create({
      data: {
        time: new Date(time),
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        temperature: temperature ? parseFloat(temperature) : null,
        precipitation: precipitation ? parseFloat(precipitation) : null,
        humidity: humidity ? parseFloat(humidity) : null,
        windSpeed: windSpeed ? parseFloat(windSpeed) : null,
        pressure: pressure ? parseFloat(pressure) : null,
        evapotranspiration: evapotranspiration ? parseFloat(evapotranspiration) : null,
      },
    });

    res.status(201).json(weatherData);
  } catch (error) {
    next(error);
  }
});

export default router;

