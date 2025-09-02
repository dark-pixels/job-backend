import express from 'express';
import { createJob, getJobs } from '../controllers/jobController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/jobs', createJob);
router.get('/jobs', getJobs);
router.post('/upload-logo', upload.single('logo'), (req, res) => {
  res.json({ path: `/uploads/${req.file.filename}` });
});

export default router;