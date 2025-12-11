import express from 'express';
import prisma from '../../config/database.js';

const router = express.Router();

// Get predictions
router.get('/', async (req, res, next) => {
  try {
    const { type, location, limit = 100 } = req.query;

    const where = {};
    if (type) where.type = type;
    if (location) where.location = location;

    const predictions = await prisma.prediction.findMany({
      where,
      orderBy: {
        predictionDate: 'desc',
      },
      take: parseInt(limit),
    });

    res.json({ data: predictions });
  } catch (error) {
    next(error);
  }
});

// Store prediction (called from Python backend bridge)
router.post('/', async (req, res, next) => {
  try {
    const {
      type,
      location,
      latitude,
      longitude,
      predictionDate,
      probability,
      predictionValue,
      modelVersion,
      features,
      weatherData,
    } = req.body;

    const prediction = await prisma.prediction.create({
      data: {
        type,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        predictionDate: new Date(predictionDate),
        probability: parseFloat(probability),
        predictionValue,
        modelVersion,
        features,
        weatherData,
      },
    });

    res.status(201).json(prediction);
  } catch (error) {
    next(error);
  }
});

export default router;

