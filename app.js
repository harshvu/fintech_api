require('dotenv').config();
const express = require('express');

const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/Portfolio', require('./routes/stockPortfolio.routes'));
app.use('/api/train', require('./routes/train.routes'));
app.use('/api/predict', require('./routes/predict.route'));
app.use('/api/predictIn', require('./routes/inMarketpredict.route'));
app.use('/api/dailyUpdates', require('./routes/DailyUpdates.route'));
app.use('/api/newsUpdates', require('./routes/newsUpdates.route'));

// Swagger setup
const { swaggerUi, swaggerSpec } = require('./docs/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
