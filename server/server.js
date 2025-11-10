import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import logRoutes from './routes/logRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

// Validate required environment variables without crashing the deploy
let configError = null;
if (!process.env.MONGODB_URI) {
  console.error('❌ Warning: MONGODB_URI is not defined in environment variables.');
  configError = 'MONGODB_URI is not configured';
}
if (!process.env.JWT_SECRET) {
  console.error('❌ Warning: JWT_SECRET is not defined in environment variables.');
  configError = (configError ? configError + ' and ' : '') + 'JWT_SECRET is not configured';
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://client-green-phi.vercel.app',
  'https://client-adarsh-pandeys-projects-f81698fb.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      // For development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now, can restrict later
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add caching headers for static responses (after routes, not before)
// Moved to individual routes to avoid conflicts

// Serve uploaded files
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Uber Fleet Driver Management API Server',
    version: '1.0.0',
    documentation: {
      api: '/api',
      health: '/api/health',
      endpoints: {
        auth: '/api/auth',
        drivers: '/api/drivers',
        logs: '/api/logs',
        dashboard: '/api/dashboard'
      }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Uber Fleet Driver Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      drivers: '/api/drivers',
      logs: '/api/logs',
      dashboard: '/api/dashboard',
      health: '/api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', configError: configError || null });
});

// MongoDB connection state
let isConnected = false;

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return;
    }
    
    // Close existing connection if any (but not connected)
    if (mongoose.connection.readyState !== 0 && mongoose.connection.readyState !== 1) {
      await mongoose.connection.close();
    }
    
    // Connect with optimized options for serverless
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    
    isConnected = true;
    
    // Only start server if not in Vercel serverless environment
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {});
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
};

// Connect to MongoDB (non-blocking for Vercel)
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

// Simplified middleware - non-blocking connection check
app.use((req, res, next) => {
  // Skip connection check for health/info endpoints
  if (req.path === '/api/health' || req.path === '/api' || req.path === '/') {
    return next();
  }
  
  // If config is invalid, fail fast with a clear error
  if (configError) {
    return res.status(500).json({ message: 'Server configuration error', details: configError });
  }
  
  // If not connected, try to connect (non-blocking)
  if (mongoose.connection.readyState !== 1) {
    if (mongoose.connection.readyState === 0) {
      connectDB().catch(console.error);
    }
  }
  next();
});

export default app;

