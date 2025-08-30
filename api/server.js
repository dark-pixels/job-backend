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

// A single variable to hold the initialized serverless handler
let serverlessHandler;

// This async function initializes the handler and checks the database connection
const initializeServer = async () => {
    if (serverlessHandler) {
        return serverlessHandler;
    }

    try {
        // Create a promise that rejects after 5 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Database connection timed out after 5 seconds.'));
            }, 5000);
        });

        // Race the database connection promise against the timeout promise
        await Promise.race([
            db.execute('SELECT 1'),
            timeoutPromise
        ]);

        console.log('✅ Connected to database.');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
    
    serverlessHandler = serverless(app);
    return serverlessHandler;
};

// Check if running on Vercel or locally
if (process.env.VERCEL_REGION) {
    // Vercel deployment
    const corsOptions = {
        origin: 'https://jobapp-cybermind.vercel.app',
        optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));
} else {
    // Local development
    const corsOptions = {
        origin: 'https://jobapp-cybermind.vercel.app',
        optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));
}

app.use(express.json());

// Define all Express routes at the top level
app.get('/', (req, res) => {
    res.json({ message: 'Job-backend server is running!' });
});

app.use('/api', jobRoutes);

// Vercel deployment handler
const handler = async (req, res) => {
    if (!serverlessHandler) {
        await initializeServer();
    }
    return serverlessHandler(req, res);
};

// Local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default handler;
