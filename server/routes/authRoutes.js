import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Driver from '../models/Driver.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Generate JWT token
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Admin Login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    res.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Driver Login (using phone number)
router.post('/driver/login', [
  body('phone').notEmpty().trim(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    // Check MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, state:', mongoose.connection.readyState);
      // Try to connect if not connected
      if (mongoose.connection.readyState === 0) {
        try {
          const MONGODB_URI = process.env.MONGODB_URI;
          if (!MONGODB_URI) {
            return res.status(500).json({ 
              message: 'Database configuration error',
              error: 'MONGODB_URI not set'
            });
          }
          await mongoose.connect(MONGODB_URI);
          console.log('MongoDB connected successfully');
        } catch (connError) {
          console.error('Connection failed:', connError);
          return res.status(503).json({ 
            message: 'Database connection unavailable. Please try again.',
            error: 'DB_CONNECTION_ERROR'
          });
        }
      } else {
        return res.status(503).json({ 
          message: 'Database connection unavailable. Please try again.',
          error: 'DB_CONNECTION_ERROR'
        });
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const driver = await Driver.findOne({ phone, isDeleted: false, isActive: true });
    
    if (!driver) {
      return res.status(401).json({ message: 'Invalid credentials or account disabled' });
    }

    if (!driver.password) {
      console.error('Driver has no password set:', driver._id);
      return res.status(500).json({ message: 'Account configuration error' });
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(driver._id, 'driver');

    res.json({
      token,
      user: {
        id: driver._id,
        email: driver.email,
        name: driver.name,
        phone: driver.phone,
        role: 'driver',
      },
    });
  } catch (error) {
    console.error('Driver login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message || 'Unknown error'
    });
  }
});

// Create initial admin (one-time setup)
router.post('/admin/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ email, password, name });
    await admin.save();

    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

