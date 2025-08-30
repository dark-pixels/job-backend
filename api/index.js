import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import path from 'path';
import fs from 'fs';
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

// ✅ Dynamic CORS setup for both local and deployed environments
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
app.options('*', cors(corsOptions)); // ✅ Handle preflight requests
app.use(express.json());

// ✅ Routes
app.get('/', (req, res) => {
    res.json({ message: 'Job-backend server is running!' });
});
app.use('/api', jobRoutes);

// ✅ Database connection and server initialization
let serverlessHandler;

const initializeServer = async () => {
    // Return the cached handler if it already exists
    if (serverlessHandler) {
        return serverlessHandler;
    }

    // Connect to the database
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
        console.error('❌ Database connection failed:', err.message);
    }

    // Create and cache the serverless handler
    serverlessHandler = serverless(app);
    return serverlessHandler;
};

// Main handler for serverless environment
const handler = async (req, res) => {
    const initializedHandler = await initializeServer();
    return initializedHandler(req, res);
};

// Check if running on Vercel or locally
if (process.env.VERCEL_REGION) {
    // Vercel deployment handler
    
} else {
    // Local development server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, async () => {
        console.log('✅ Starting local server...');
        await initializeServer();
        console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
}
