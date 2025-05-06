// server.js

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://www.pagomigo.com', 'https://pagomigo.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true
}));
console.log('CORS enabled for origins: https://www.pagomigo.com, https://pagomigo.com, http://localhost:3000');

//const isProd = process.env.NODE_ENV === 'production';
//app.use(session({
const sessionOptions = { //temp
  secret: process.env.SESSION_SECRET || 'someSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd, // Set to true if using HTTPS
    sameSite: isProd ? 'none' : 'lax', // Adjust based on your needs
    httpOnly: true
  }
};

console.log('Session options:0, sessionOptions')
app.use(session(sessionOptions));
// Middleware to parse JSON and URL-encoded data

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// Middleware to catch URI errors
app.use((req, res, next) => {
  try {
    decodeURIComponent(req.path);
    next();
  } catch (err) {
    console.warn('Bad URI:', req.path);
    res.status(400).send('Bad Request');
  }
});

// In Express server.js or app.js
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next(); 

  const ignorePaths = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];
  if (ignorePaths.includes(req.path)) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/api/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/public/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/static/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/assets/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/images/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/css/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/js/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/fonts/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/videos/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/audio/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/docs/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/uploads/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/downloads/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/api/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/api/v1/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/api/v2/')) {
    return res.status(200).send('OK');
  }
  if (req.path.startsWith('/api/v3/')) {
    return res.status(200).send('OK');
  }
  
  if (req.hostname === 'pagomigo.com') {  
    return res.redirect(301, `https://www.pagomigo.com${req.originalUrl}`);
  }
  if (req.hostname === 'www.pagomigo.com') {
    return res.redirect(301, `https://www.pagomigo.com${req.originalUrl}`);
  }
  if (req.hostname === 'test.pagomigo.com') {
    return res.redirect(301, `https://www.pagomigo.com${req.originalUrl}`);
  }
  if (req.hostname === 'api.pagomigo.com') {
    return res.redirect(301, `https://www.pagomigo.com${req.originalUrl}`);
  }
  if (req.hostname === 'test.api.pagomigo.com') {
    return res.redirect(301, `https://www.pagomigo.com${req.originalUrl}`);
  }
  if (req.hostname === 'localhost') {
    return res.redirect(301, `https://www.pagomigo.com${req.originalUrl}`);
  }
  next();
});

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/requests', requestRoutes);

// Basic test route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Pagomigo API is alive!' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Export the app for testing
