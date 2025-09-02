import express from 'express';
import { createJob, getJobs } from '../controllers/jobController.js';

const router = express.Router();

// ✅ Create a new job with base64 logo
router.post('/jobs', createJob);

// ✅ Get all jobs with filters
router.get('/jobs', getJobs);

export default router;