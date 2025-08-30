import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Import the database connection and router
import db from '../models/db.js';
import jobRoutes from '../routes/jobRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Add a simple health check route
app.get('/', (req, res) => {
    res.json({ message: 'Job-backend server is running!' });
});

// Use the job routes for API Endpoints
app.use('/api', jobRoutes);

// Database connection check and server export
const server = (async () => {
    try {
        await db.execute('SELECT 1');
        console.log('✅ Connected to database.');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
    return serverless(app);
})();

// ✅ Export as serverless function
export default async (req, res) => {
  const handler = await server;
  return handler(req, res);
};
