const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/trainings', require('./routes/training.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/tests', require('./routes/test.routes'));
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/results', require('./routes/result.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Studies LMS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in your .env file');
  process.exit(1);
}

// Mongoose connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,  // fail fast instead of hanging 30s
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

// Connection event listeners (useful for debugging)
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB');
});

// Graceful shutdown — close DB connection when process exits
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed (app termination)');
  process.exit(0);
});

// Connect and start server
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log(`✅ Connected to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB');
    console.error('   URI:', MONGODB_URI);
    console.error('   Error:', err.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Is MongoDB running? Run: net start MongoDB  (Windows)');
    console.error('      or: brew services start mongodb-community  (Mac)');
    console.error('      or: sudo systemctl start mongod            (Linux)');
    console.error('   2. Using Atlas? Check your connection string and IP whitelist');
    console.error('   3. Check MONGODB_URI in your .env file\n');
    process.exit(1);
  }
}

startServer();

module.exports = app;
