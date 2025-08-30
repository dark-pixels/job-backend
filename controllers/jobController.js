import db from '../models/db.js';

export const createJob = async (req, res) => {
    const {
        title, company, location, type,
        salary, experience, deadline, description, isDraft
    } = req.body;

    try {
        const [result] = await db.execute(
            `INSERT INTO jobs (title, company, location, type, salary, experience, deadline, description, isDraft)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, company, location, type, salary, experience, deadline, description, isDraft]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getJobs = async (req, res) => {
    const { title, location, type, salaryMax } = req.query;
    let query = 'SELECT * FROM jobs WHERE isDraft = false';
    const params = [];

    if (title) {
        query += ' AND title LIKE ?';
        params.push(`${title}%`); // Changed to start with the value
    }
    if (location) {
        query += ' AND location LIKE ?';
        params.push(`${location}%`); // Changed to start with the value
    }
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    if (salaryMax) {
        query += ' AND salary <= ?';
        params.push(salaryMax);
    }

    try {
        const [rows] = await db.execute(query, params);
        if (rows.length === 0) {
            return res.status(404).json({ message: "No jobs found matching your criteria." });
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
