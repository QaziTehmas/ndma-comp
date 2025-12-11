import express from 'express';
import prisma from '../../config/database.js';

const router = express.Router();

// Get emergency contacts
router.get('/contacts', async (req, res, next) => {
  try {
    const { province, category } = req.query;

    const where = {};
    if (province) where.province = province;
    if (category) where.category = category;

    const contacts = await prisma.emergencyContact.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { province: 'asc' },
      ],
    });

    res.json({ data: contacts });
  } catch (error) {
    next(error);
  }
});

export default router;

