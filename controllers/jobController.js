import db from '../models/db.js';

export const createJob = async (req, res) => {
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
    logoBase64,
  } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO jobs (title, company, location, type, salary, experience, deadline, description, isDraft, logoBase64)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, location, type, salary, experience, deadline, description, isDraft, logoBase64]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getJobs = async (req, res) => {
  const { search, location, type, minSalary, maxSalary } = req.query;
  let query = 'SELECT * FROM jobs WHERE isDraft = false';
  const params = [];

  if (search) {
    query += ' AND LOWER(title) LIKE ?';
    params.push(`%${search.toLowerCase()}%`);
  }

  if (location) {
    query += ' AND LOWER(location) LIKE ?';
    params.push(`%${location.toLowerCase()}%`);
  }

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (minSalary != null && !isNaN(minSalary)) {
    query += ' AND salary >= ?';
    params.push(Number(minSalary));
  }

  if (maxSalary != null && !isNaN(maxSalary)) {
    query += ' AND salary <= ?';
    params.push(Number(maxSalary));
  }

  try {
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};