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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Check if your MongoDB Atlas connection string is correct');
      console.error('2. Make sure you replaced <password> and <dbname> in the connection string');
      console.error('3. Verify your MongoDB Atlas cluster is running and accessible');
      console.error('4. Check your network connection');
      console.error('5. Ensure your IP address is whitelisted in MongoDB Atlas Network Access');
    }
    process.exit(1);
  });

export default app;

