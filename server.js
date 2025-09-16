// server.js - Backend for Railway Reservation System

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const port = 3000;

// --- Database Connection Configuration ---
// These details must match your MySQL setup from database.sql
const dbConfig = {
    host: 'localhost',
    user: 'adminuser',
    password: 'adminuser1234',
    database: 'railway_reservation'
};

// --- API Endpoint to Fetch Trains ---
app.get('/api/trains', async (req, res) => {
    // Get search criteria from the query parameters
    const { from, to, date, class: journeyClass } = req.query;

    // Basic validation
    if (!from || !to || !date || !journeyClass) {
        return res.status(400).json({ error: 'Missing required search parameters.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        // SQL query to find trains based on route, date, and class
        const sql = `
            SELECT 
                t.train_no, t.train_name, t.departure_time, t.arrival_time, 
                t.duration, a.status
            FROM trains t
            JOIN availability a ON t.train_no = a.train_no
            WHERE 
                t.from_station = ? 
                AND t.to_station = ? 
                AND a.journey_date = ?
                AND a.class_type = ?
        `;
        
        // Execute the query safely with parameters
        const [rows] = await connection.execute(sql, [from, to, date, journeyClass]);
        
        // Format the data for the frontend
        const formattedTrains = rows.map(row => {
            const status = row.status.toLowerCase();
            let availability = "";

            if (status.includes("available")) {
                const seats = status.split('-')[1] || 0;
                availability = `Available (${seats} seats)`;
            } else if (status.includes("regret")) {
                availability = "Regret/No Seats";
            } else if (status.includes("waitlist")) {
                const wl = status.split('-')[1] || 0;
                availability = `Waitlist (${wl})`;
            } else {
                availability = row.status;
            }

            return {
                no: row.train_no,
                name: row.train_name,
                departure: row.departure_time.substring(0, 5),
                arrival: row.arrival_time.substring(0, 5),
                duration: row.duration,
                availability: availability
            };
        });

        res.json(formattedTrains);
        await connection.end();

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch data from the database.' });
    }
});

// --- Serve the Frontend ---
// This serves your index.html file and other static files
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});