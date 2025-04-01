import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import path from 'path';
import promisePool from './config/db.config.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import templateRoutes from './routes/template.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import initializePassport from './config/passport.config.js';
import { handleAuthCallback, serializeUser, deserializeUser } from './controllers/auth.controller.js';
import savedTemplateRoutes from './routes/savedTemplate.routes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables before any other imports
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration - must be before passport
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Session configuration - must be before passport
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using https
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Initialize passport with handlers - after middleware setup
initializePassport(handleAuthCallback, serializeUser, deserializeUser);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', savedTemplateRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('TemplateForge API is running');
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    const connection = await promisePool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error initializing app:', error);
    process.exit(1);
  }
};

initializeApp();

export default app;