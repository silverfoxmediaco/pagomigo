// server.js
require('dotenv').config();
const express = require('express');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
//const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const requestRoutes = require('./routes/requestRoutes');
const isProd = process.env.NODE_ENV === 'production';

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
    ttl: 14 * 24 * 60 * 60, // Sessions expire in 14 days
    stringify: false,
  }),
  cookie: {
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    httpOnly: true,
    domain: isProd ? '.pagomigo.com' : undefined,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/requests', requestRoutes);

// Global Redirects

const isProd = process.env.NODE_ENV === 'production';

app.use((req, res, next) => {
  // Allow CORS preflight requests to pass through
  if (req.method === 'OPTIONS') return next();

  // Only apply domain enforcement in production
  if (isProd) {
    const isApi = req.path.startsWith('/api/');
    const isNonWWW = req.hostname === 'pagomigo.com';

    // Redirect all non-www requests (API or HTML) to www.pagomigo.com
    // This keeps your domain consistent and avoids session/cookie issues
    if (isNonWWW) {
      return res.redirect(301, `https://www.pagomigo.com${req.originalUrl}`);
    }
  }

  next();
});



/*app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
//---boolean constants
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
});*/
// static files
//app.use(express.static(path.join(__dirname, 'public', 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// URI decode error catch
app.use((req, res, next) => {
  try {
    decodeURIComponent(req.path);
    next();
  } catch (err) {
    console.warn('Bad URI:', req.path);
    res.status(400).send('Bad Request');
  }
});

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

