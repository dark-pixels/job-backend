import express from 'express';
import { createJob, getJobs } from '../controllers/jobController.js';

const router = express.Router();

// Define API routes
router.post('/jobs', createJob);
router.get('/jobs', getJobs);

export default router;
