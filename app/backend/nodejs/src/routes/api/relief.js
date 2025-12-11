import express from 'express';
import prisma from '../../config/database.js';

const router = express.Router();

// Get relief stocks
router.get('/stocks', async (req, res, next) => {
  try {
    const { province, location } = req.query;

    const where = {};
    if (province) where.province = province;
    if (location) where.location = location;

    const stocks = await prisma.reliefStock.findMany({
      where,
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    res.json({ data: stocks });
  } catch (error) {
    next(error);
  }
});

export default router;

