import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import cookieSession from 'cookie-session';
import promisePool from './config/db.config.js';
import authRoutes from './routes/auth.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Session configuration
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  keys: [process.env.SESSION_KEY]
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('TemplateForge API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to database
promisePool.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

export default app;