import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import db from '../models/db.js';
import jobRoutes from '../routes/jobRoutes.js';

const app = express();

// ✅ CORS setup
const localOrigin = 'http://localhost:3000';
const deployedOrigin = 'https://jobapp-cybermind.vercel.app';

const corsOptions = {
  origin: (origin, callback) => {
    if (origin === localOrigin || origin === deployedOrigin || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// ✅ Root route
app.get('/', (req, res) => {
  res.json({ message: 'Job-backend server is running!' });
});

// ✅ API routes
app.use('/api', jobRoutes);

// ✅ Serverless handler setup
let serverlessHandler;

const initializeServer = async () => {
  if (serverlessHandler) return serverlessHandler;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB connection timed out')), 5000)
    );
    await Promise.race([db.execute('SELECT 1'), timeoutPromise]);
    console.log('✅ Connected to database.');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }

  serverlessHandler = serverless(app);
  return serverlessHandler;
};

const handler = async (req, res) => {
  const initializedHandler = await initializeServer();
  return initializedHandler(req, res);
};

// ✅ Local vs Vercel deployment
if (process.env.VERCEL_REGION) {
  // Vercel deployment
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    console.log('✅ Starting local server...');
    await initializeServer();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}