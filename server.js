import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import serverless from 'serverless-http';

dotenv.config();

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

// ✅ GET all jobs
app.get('/api/jobs', (req, res) => {
  const sql = 'SELECT * FROM jobs';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching jobs:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// ✅ POST new job
app.post('/api/jobs', (req, res) => {
  const {
    title,
    company,
    location,
    type,
    salary,
    experience,
    deadline,
    description,
    isDraft,
  } = req.body;

  const sql = `
    INSERT INTO jobs (title, company, location, type, salary, experience, deadline, description, isDraft)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [title, company, location, type, salary, experience, deadline, description, isDraft],
    (err, result) => {
      if (err) {
        console.error('Error inserting job:', err);
        return res.status(500).json({ error: 'Database insert failed' });
      }
      res.json({ message: 'Job created successfully', id: result.insertId });
    }
  );
});

// ✅ Export as serverless function
export default serverless(app);