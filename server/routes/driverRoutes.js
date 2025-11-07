import express from 'express';
import { body, validationResult } from 'express-validator';
import Driver from '../models/Driver.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all drivers (Admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const drivers = await Driver.find(query)
      .select('-password')
      .sort(sortOptions);

    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single driver (Admin or Driver themselves)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    // Drivers can only view their own profile
    if (role === 'driver' && userId !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const driver = await Driver.findOne({ _id: id, isDeleted: false })
      .select('-password');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new driver (Admin only)
router.post('/', authenticateToken, isAdmin, [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty(),
  body('licenseNumber').notEmpty(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, licenseNumber, password } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({
      $or: [{ email }, { phone }, { licenseNumber }],
      isDeleted: false,
    });

    if (existingDriver) {
      return res.status(400).json({ message: 'Driver with this email, phone number, or license number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = new Driver({
      name,
      email,
      phone,
      licenseNumber,
      password: hashedPassword,
    });

    await driver.save();

    const driverResponse = driver.toObject();
    delete driverResponse.password;

    res.status(201).json(driverResponse);
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update driver (Admin only)
router.put('/:id', authenticateToken, isAdmin, [
  body('name').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().notEmpty(),
  body('licenseNumber').optional().notEmpty(),
  body('isActive').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.password; // Don't allow password update here

    // Check if phone, email, or licenseNumber already exists for another driver
    if (updateData.phone || updateData.email || updateData.licenseNumber) {
      const checkQuery = {
        _id: { $ne: id },
        isDeleted: false,
        $or: [],
      };
      
      if (updateData.phone) checkQuery.$or.push({ phone: updateData.phone });
      if (updateData.email) checkQuery.$or.push({ email: updateData.email });
      if (updateData.licenseNumber) checkQuery.$or.push({ licenseNumber: updateData.licenseNumber });

      if (checkQuery.$or.length > 0) {
        const existingDriver = await Driver.findOne(checkQuery);
        if (existingDriver) {
          return res.status(400).json({ message: 'Driver with this email, phone number, or license number already exists' });
        }
      }
    }

    const driver = await Driver.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Soft delete driver (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({ message: 'Driver deleted successfully', driver });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

