import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Import DB and routes
import db from '../models/db.js';
import jobRoutes from '../routes/jobRoutes.js';

const app = express();

// CORS setup
const corsOptions = {
  origin: 'https://jobapp-cybermind.vercel.app',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Job-backend server is running!' });
});
app.use('/api', jobRoutes);

// Serverless handler
let serverlessHandler;

const initializeServer = async () => {
  if (serverlessHandler) return serverlessHandler;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB connection timed out')), 5000)
    );

    await Promise.race([
      db.execute('SELECT 1'),
      timeoutPromise,
    ]);

    console.log('✅ Connected to database.');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }

  serverlessHandler = serverless(app);
  return serverlessHandler;
};

const handler = async (req, res) => {
  if (!serverlessHandler) {
    await initializeServer();
  }
  return serverlessHandler(req, res);
};

export default handler;