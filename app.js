require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // <-- Logging
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Log HTTP requests to console

// Routes
  app.use('/api/auth', require('./routes/auth.routes'));
  app.use('/api/users', require('./routes/user.routes'));
  app.use('/api/Portfolio', require('./routes/stockPortfolio.routes'));
  app.use('/api/train', require('./routes/train.routes'));
  app.use('/api/predict', require('./routes/predict.route'));
  app.use('/api/dailyUpdates', require('./routes/DailyUpdates.route'));
  app.use('/api/predictIn', require('./routes/inMarketpredict.route'));
  app.use('/api/newsUpdates', require('./routes/newsUpdates.route'));
  app.use('/api/search', require('./routes/chat.routes'));
  app.use('/api/feedback', require('./routes/feedback.routes'));
  app.use('/api/validatepredictpre', require('./routes/validatepredictpre.route'));
  app.use('/api/validatepredictIn', require('./routes/validatepredictIn.route'));
  app.use('/api/admin', require('./routes/adminRoutes'));
// Swagger Docs
const { swaggerUi, swaggerSpec } = require('./docs/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Catch 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});
// avnish sir code
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
//cron 
//require("./cron/cron.js");
// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
