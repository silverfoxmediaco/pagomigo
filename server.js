// server.js

require('dotenv').config();
const express = require('express');

const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const requestRoutes = require('./routes/requestRoutes');
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

const app = express();

app.use(cors({
  origin: ['https://www.pagomigo.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'someSecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 days
  }),

    cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: isProd ? '.pagomigo.com' : undefined,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

app.get('/test-cookie', (req, res) => {
  res.cookie('connect.sid', 'test-session-value', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: isProd ? '.pagomigo.com' : undefined,
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  res.send('Test cookie has been set.');
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const isApi = req.path.startsWith('/api/');
  const isWWW = req.hostname === 'www.pagomigo.com';
  const isMainDomain = req.hostname === 'pagomigo.com';

  // Block API usage from non-www domains
  if (isMainDomain && isApi) {
    return res.status(403).send('API access must go through www.pagomigo.com');
  }

  // Redirect HTML/page requests to www
  if (isMainDomain && !isApi) {
    return res.redirect(301, `https://www.pagomigo.com${req.originalUrl}`);
  }

  next();
});

app.use((req, res, next) => {
  try {
    decodeURIComponent(req.path);
    next();
  } catch (err) {
    console.warn('Bad URI:', req.path);
    res.status(400).send('Bad Request');
  }
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
