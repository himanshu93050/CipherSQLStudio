const express = require('express');
const cors = require('cors');
const { connectMongo } = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
// Allow CORS from the frontend (development). Explicitly set allowed origin.
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Fallback: ensure CORS headers are present on any response (helps on error paths)
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

// Connect Persistence DB (MongoDB) 
connectMongo();

app.get('/', (req, res) => {
  res.send('CipherStudio Backend is running!');
});

// Routes
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));