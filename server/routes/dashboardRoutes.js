import express from 'express';
import mongoose from 'mongoose';
import DailyLog from '../models/DailyLog.js';
import Driver from '../models/Driver.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Dashboard Stats
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Total drivers
    const totalDrivers = await Driver.countDocuments({ isDeleted: false });

    // Aggregate stats from all logs
    const stats = await DailyLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalKm: { $sum: '$totalKm' },
          totalFuelCost: { $sum: '$fuelCost' },
          totalOtherExpenses: { $sum: '$otherExpenses' },
          totalCashCollected: { $sum: '$cashCollected' },
          totalOnlineCollected: { $sum: '$onlineCollected' },
          totalEarnings: { $sum: '$totalEarnings' },
        },
      },
    ]);

    const result = stats[0] || {
      totalKm: 0,
      totalFuelCost: 0,
      totalOtherExpenses: 0,
      totalCashCollected: 0,
      totalOnlineCollected: 0,
      totalEarnings: 0,
    };

    res.json({
      totalDrivers,
      totalKm: result.totalKm,
      totalExpenses: result.totalFuelCost + result.totalOtherExpenses,
      totalCashCollected: result.totalCashCollected,
      totalOnlineCollected: result.totalOnlineCollected,
      totalEarnings: result.totalEarnings,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Driver Dashboard Stats
router.get('/driver', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    if (role !== 'driver') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { period = 'month' } = req.query; // 'week' or 'month'
    const now = new Date();
    const startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    // Set time to start of day for startDate and end of day for now
    startDate.setHours(0, 0, 0, 0);
    now.setHours(23, 59, 59, 999);

    // Convert userId to ObjectId
    const driverObjectId = new mongoose.Types.ObjectId(userId);

    const dateFilter = {
      driverId: driverObjectId,
      date: { $gte: startDate, $lte: now },
    };

    console.log('Driver dashboard query:', {
      userId,
      driverObjectId: driverObjectId.toString(),
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });

    // Aggregate stats
    const stats = await DailyLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalKm: { $sum: '$totalKm' },
          totalCashCollected: { $sum: '$cashCollected' },
          totalOnlineCollected: { $sum: '$onlineCollected' },
          totalExpenses: {
            $sum: { $add: ['$fuelCost', '$otherExpenses'] },
          },
          totalEarnings: { $sum: '$totalEarnings' },
        },
      },
    ]);

    console.log('Aggregation result:', JSON.stringify(stats, null, 2));

    const result = stats[0] || {
      totalKm: 0,
      totalCashCollected: 0,
      totalOnlineCollected: 0,
      totalExpenses: 0,
      totalEarnings: 0,
    };

    console.log('Final result:', result);

    res.json({
      period,
      totalKm: result.totalKm,
      totalCashCollected: result.totalCashCollected,
      totalOnlineCollected: result.totalOnlineCollected,
      totalExpenses: result.totalExpenses,
      totalEarnings: result.totalEarnings,
    });
  } catch (error) {
    console.error('Driver dashboard error:', error);
    console.error('Error details:', {
      userId,
      driverObjectId,
      dateFilter,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get driver logs for admin view
router.get('/driver/:driverId/logs', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { driverId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { driverId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await DailyLog.find(query)
      .populate('driverId', 'name email')
      .sort({ date: -1 });

    res.json(logs);
  } catch (error) {
    console.error('Get driver logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

