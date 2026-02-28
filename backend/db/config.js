// Use Neon's serverless driver for Vercel if DATABASE_URL is present, otherwise fallback to local 'pg'
const pg = require('pg');
const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

// Support both DATABASE_URL (Neon/Vercel) and individual vars
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
    })
    : new pg.Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'apex_db',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('DB connection error:', err.message);
        console.log('Running in mock data mode.');
    } else {
        console.log('Connected to PostgreSQL at', res.rows[0].now);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
