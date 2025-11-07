import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import logRoutes from './routes/logRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not defined in .env file');
  console.error('Please create a .env file in the server directory with:');
  console.error('MONGODB_URI=your_mongodb_atlas_connection_string');
  console.error('JWT_SECRET=your_jwt_secret_key');
  console.error('PORT=5000');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ Error: JWT_SECRET is not defined in .env file');
  process.exit(1);
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined');
      throw new Error('MONGODB_URI is not defined');
    }
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    isConnected = true;
    
    // Only start server if not in Vercel serverless environment
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Check if your MongoDB Atlas connection string is correct');
      console.error('2. Make sure you replaced <password> and <dbname> in the connection string');
      console.error('3. Verify your MongoDB Atlas cluster is running and accessible');
      console.error('4. Check your network connection');
      console.error('5. Ensure your IP address is whitelisted in MongoDB Atlas Network Access');
    }
    // Don't exit in Vercel - let it retry
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
    throw error;
  }
};

// Connect to MongoDB (non-blocking for Vercel)
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

// Middleware to ensure MongoDB connection before handling requests
app.use(async (req, res, next) => {
  // Skip connection check for health endpoint
  if (req.path === '/api/health' || req.path === '/api' || req.path === '/') {
    return next();
  }
  
  // Check connection state
  if (mongoose.connection.readyState !== 1) {
    // Try to connect if not connected
    if (mongoose.connection.readyState === 0) {
      try {
        await connectDB();
      } catch (error) {
        console.error('Connection attempt failed:', error);
        return res.status(503).json({ 
          message: 'Database connection not available',
          error: 'Please try again in a moment'
        });
      }
    } else {
      return res.status(503).json({ 
        message: 'Database connection not available',
        error: 'Please try again in a moment'
      });
    }
  }
  next();
});

export default app;

