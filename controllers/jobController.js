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
    const { title, location, type, salaryMin, salaryMax } = req.query;
    let query = 'SELECT * FROM jobs WHERE isDraft = false';
    const params = [];

    if (title) {
        query += ' AND title LIKE ?';
        params.push(`%${title}%`);
    }
    if (location) {
        query += ' AND location LIKE ?';
        params.push(`%${location}%`);
    }
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    if (salaryMin) {
        query += ' AND salary >= ?';
        params.push(salaryMin);
    }
    if (salaryMax) {
        query += ' AND salary <= ?';
        params.push(salaryMax);
    }

    try {
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
