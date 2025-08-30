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

// Configure CORS to only allow requests from your frontend URL
const corsOptions = {
    origin: 'https://jobapp-cybermind.vercel.app',
    optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json());

// Define all Express routes at the top level
app.get('/', (req, res) => {
    res.json({ message: 'Job-backend server is running!' });
});

app.use('/api', jobRoutes);

// A single variable to hold the serverless handler
let serverlessHandler;

// This async function initializes the server and checks the database connection
const initializeServer = async () => {
    // Check if the handler is already initialized to avoid re-running on every request
    if (serverlessHandler) {
        return serverlessHandler;
    }

    try {
        await db.execute('SELECT 1');
        console.log('✅ Connected to database.');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
    
    // Create the serverless handler after all routes are defined
    serverlessHandler = serverless(app);
    return serverlessHandler;
};

// Export the serverless function
export default async (req, res) => {
    const handler = await initializeServer();
    return handler(req, res);
};
