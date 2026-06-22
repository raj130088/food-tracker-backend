const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const mealRoutes = require('./routes/meal.routes');
const userRoutes = require('./routes/user.routes');
const aiRoutes = require('./ai/ai.routes');

const authMiddleware = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/error.middleware');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Protected test route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'You are authenticated!',
    user: req.user
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({
    service: 'Food Tracker API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Global error handler MUST be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});