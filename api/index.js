import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';
import jobRoutes from '../routes/jobRoutes.js';
import db from '../models/db.js';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

// ✅ CORS setup for deployed frontend
const corsOptions = {
    origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
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

// ✅ Serverless handler
let serverlessHandler;

const initializeServer = async () => {
    if (serverlessHandler) return serverlessHandler;

    try {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('DB connection timed out')), 3000)
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
    try {
        if (!serverlessHandler) {
            await initializeServer();
        }
        return await serverlessHandler(req, res);
    } catch (err) {
        console.error('❌ Serverless function crashed:', err);
        res.setHeader('Access-Control-Allow-Origin', corsOptions.origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

// This section is only for local development
if (!process.env.VERCEL_URL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
    });
}

// ✅ Export for Vercel
export default handler;
