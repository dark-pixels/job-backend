import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly configure dotenv to find the .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // Optional for cloud DBs
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to database.');
});

// Assuming jobRoutes.js exports the router as a named export
import { router as jobRoutes } from '../routes/jobRoutes.js';
app.use('/api', jobRoutes);

// ✅ New route for the root path to prevent continuous loading
app.get('/', (req, res) => {
  res.status(200).send('Hello from the Job-Backend API! The server is running.');
});

// ✅ Export as a serverless function
export default serverless(app);
