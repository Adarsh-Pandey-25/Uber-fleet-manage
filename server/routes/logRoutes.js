import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import DailyLog from '../models/DailyLog.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import createCsvWriter from 'csv-writer';
import PDFDocument from 'pdfkit';
import upload from '../middleware/uploadMiddleware.js';
import ExcelJS from 'exceljs';

const router = express.Router();

// Get logs (Admin can see all, Driver can see only their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { driverId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    
    if (role === 'driver') {
      query.driverId = new mongoose.Types.ObjectId(userId);
    } else if (driverId) {
      query.driverId = new mongoose.Types.ObjectId(driverId);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await DailyLog.find(query)
      .populate('driverId', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DailyLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single log
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    const log = await DailyLog.findById(id).populate('driverId', 'name email');

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    // Drivers can only view their own logs
    if (role === 'driver' && log.driverId._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(log);
  } catch (error) {
    console.error('Get log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create log entry with file upload
router.post('/', authenticateToken, upload.single('expenseBill'), [
  body('date').isISO8601().toDate(),
  body('totalKm').isFloat({ min: 0 }),
  body('fuelCost').isFloat({ min: 0 }),
  body('otherExpenses').optional().isFloat({ min: 0 }),
  body('cashCollected').isFloat({ min: 0 }),
  body('onlineCollected').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Expense bill file is required' });
    }

    const { role, userId } = req.user;
    const { date, totalKm, fuelCost, otherExpenses = 0, cashCollected, onlineCollected } = req.body;

    // Drivers can only create logs for themselves
    const driverId = role === 'driver' 
      ? new mongoose.Types.ObjectId(userId) 
      : req.body.driverId 
        ? new mongoose.Types.ObjectId(req.body.driverId) 
        : new mongoose.Types.ObjectId(userId);

    // Check if log already exists for this date and driver
    const existingLog = await DailyLog.findOne({
      driverId,
      date: new Date(date),
    });

    if (existingLog) {
      // Delete uploaded file if log already exists
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Log entry already exists for this date' });
    }

    // File path relative to uploads directory
    const expenseBillPath = `/uploads/expense-bills/${req.file.filename}`;

    const log = new DailyLog({
      driverId,
      date: new Date(date),
      totalKm,
      fuelCost,
      otherExpenses,
      cashCollected,
      onlineCollected,
      expenseBill: expenseBillPath,
    });

    await log.save();
    await log.populate('driverId', 'name email');

    res.status(201).json(log);
  } catch (error) {
    console.error('Create log error:', error);
    // Delete uploaded file on error
    if (req.file) {
      const fs = await import('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Log entry already exists for this date' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update log entry with optional file upload
router.put('/:id', authenticateToken, upload.single('expenseBill'), [
  body('date').optional().isISO8601().toDate(),
  body('totalKm').optional().isFloat({ min: 0 }),
  body('fuelCost').optional().isFloat({ min: 0 }),
  body('otherExpenses').optional().isFloat({ min: 0 }),
  body('cashCollected').optional().isFloat({ min: 0 }),
  body('onlineCollected').optional().isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { role, userId } = req.user;

    const log = await DailyLog.findById(id);

    if (!log) {
      // Delete uploaded file if log not found
      if (req.file) {
        const fs = await import('fs');
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Log not found' });
    }

    // Drivers can only update their own logs
    if (role === 'driver' && log.driverId.toString() !== userId.toString()) {
      // Delete uploaded file on access denied
      if (req.file) {
        const fs = await import('fs');
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { ...req.body };
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    // If new file is uploaded, delete old file and update path
    if (req.file) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      // Delete old file
      if (log.expenseBill) {
        const oldFilePath = path.join(__dirname, '..', log.expenseBill);
        try {
          fs.unlinkSync(oldFilePath);
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }
      
      // Update with new file path
      updateData.expenseBill = `/uploads/expense-bills/${req.file.filename}`;
    }

    Object.assign(log, updateData);
    await log.save();
    await log.populate('driverId', 'name email');

    res.json(log);
  } catch (error) {
    console.error('Update log error:', error);
    // Delete uploaded file on error
    if (req.file) {
      const fs = await import('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete log entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    const log = await DailyLog.findById(id);

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    // Drivers can only delete their own logs
    if (role === 'driver' && log.driverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await DailyLog.findByIdAndDelete(id);

    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export logs as CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { driverId, startDate, endDate } = req.query;

    const query = {};
    
    if (role === 'driver') {
      query.driverId = new mongoose.Types.ObjectId(userId);
    } else if (driverId) {
      query.driverId = new mongoose.Types.ObjectId(driverId);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await DailyLog.find(query)
      .populate('driverId', 'name email')
      .sort({ date: -1 });

    const csvData = logs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      driverName: log.driverId.name,
      driverEmail: log.driverId.email,
      totalKm: log.totalKm,
      fuelCost: log.fuelCost,
      otherExpenses: log.otherExpenses,
      cashCollected: log.cashCollected,
      onlineCollected: log.onlineCollected,
      totalEarnings: log.totalEarnings,
    }));

    const csvWriter = createCsvWriter.createObjectCsvStringifier({
      header: [
        { id: 'date', title: 'Date' },
        { id: 'driverName', title: 'Driver Name' },
        { id: 'driverEmail', title: 'Driver Email' },
        { id: 'totalKm', title: 'Total KM' },
        { id: 'fuelCost', title: 'Fuel Cost' },
        { id: 'otherExpenses', title: 'Other Expenses' },
        { id: 'cashCollected', title: 'Cash Collected' },
        { id: 'onlineCollected', title: 'Online Collected' },
        { id: 'totalEarnings', title: 'Total Earnings' },
      ],
    });

    const csv = csvWriter.getHeaderString() + csvWriter.stringifyRecords(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=driver-logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export logs as XLSX (Excel)
router.get('/export/xlsx', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { driverId, startDate, endDate } = req.query;

    const query = {};
    if (role === 'driver') {
      query.driverId = new mongoose.Types.ObjectId(userId);
    } else if (driverId) {
      query.driverId = new mongoose.Types.ObjectId(driverId);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await DailyLog.find(query)
      .populate('driverId', 'name phone email')
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Driver Logs');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Driver Name', key: 'driverName', width: 24 },
      { header: 'Driver Number', key: 'driverPhone', width: 18 },
      { header: 'Total KM', key: 'totalKm', width: 12 },
      { header: 'Fuel Cost', key: 'fuelCost', width: 14 },
      { header: 'Other Expenses', key: 'otherExpenses', width: 16 },
      { header: 'Cash Collected', key: 'cashCollected', width: 16 },
      { header: 'Online Collected', key: 'onlineCollected', width: 17 },
      { header: 'Total Earnings', key: 'totalEarnings', width: 16 },
    ];

    logs.forEach((log) => {
      worksheet.addRow({
        date: log.date.toISOString().split('T')[0],
        driverName: log.driverId.name,
        driverPhone: log.driverId.phone || '',
        totalKm: log.totalKm,
        fuelCost: log.fuelCost,
        otherExpenses: log.otherExpenses,
        cashCollected: log.cashCollected,
        onlineCollected: log.onlineCollected,
        totalEarnings: log.totalEarnings,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=driver-logs.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export XLSX error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export logs as PDF
router.get('/export/pdf', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { driverId, startDate, endDate } = req.query;

    const query = {};
    
    if (role === 'driver') {
      query.driverId = new mongoose.Types.ObjectId(userId);
    } else if (driverId) {
      query.driverId = new mongoose.Types.ObjectId(driverId);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await DailyLog.find(query)
      .populate('driverId', 'name email')
      .sort({ date: -1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=driver-logs.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Driver Daily Logs Report', { align: 'center' });
    doc.moveDown();

    logs.forEach((log, index) => {
      if (index > 0) doc.moveDown();
      doc.fontSize(14).text(`Date: ${log.date.toISOString().split('T')[0]}`, { underline: true });
      doc.fontSize(12).text(`Driver: ${log.driverId.name} (${log.driverId.email})`);
      doc.text(`Total KM: ${log.totalKm}`);
      doc.text(`Fuel Cost: ₹${log.fuelCost.toFixed(2)}`);
      doc.text(`Other Expenses: ₹${log.otherExpenses.toFixed(2)}`);
      doc.text(`Cash Collected: ₹${log.cashCollected.toFixed(2)}`);
      doc.text(`Online Collected: ₹${log.onlineCollected.toFixed(2)}`);
      doc.text(`Total Earnings: ₹${log.totalEarnings.toFixed(2)}`);
    });

    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

