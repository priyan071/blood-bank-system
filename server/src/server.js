require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');
const { seedData } = require('./seeds/seed.js');

// Import routes
const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const testingRoutes = require('./routes/testingRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const requestRoutes = require('./routes/requestRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date(),
    service: 'Blood Bank Management System API',
    institution: 'Easwari Engineering College - CSE (AIML)',
    author: 'Priyan R (310624148072)',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tests', testingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server and initialize database
async function startServer() {
  try {
    await connectDB();

    // Auto-seed if database has 0 users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial demonstration seeder...');
      await seedData(true);
    }

    const server = app.listen(PORT, () => {
      console.log(`[BloodBank API] Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });

    return server;
  } catch (err) {
    console.error('[BloodBank API] Server failed to start:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
