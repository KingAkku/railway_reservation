// server.js - Backend for Railway Reservation System

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const port = 3000;

// --- Database Connection Configuration ---
const dbConfig = {
    host: 'localhost',
    user: 'adminuser',
    password: 'adminuser1234',
    database: 'railway_reservation'
};

// --- Middleware ---
// This is new! It allows our server to read JSON data from request bodies.
app.use(express.json());

// --- API Endpoint to Fetch Trains ---
app.get('/api/trains', async (req, res) => {
    // ... (This function remains unchanged)
    const { from, to, date, class: journeyClass } = req.query;
    if (!from || !to || !date || !journeyClass) {
        return res.status(400).json({ error: 'Missing required search parameters.' });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const sql = `
            SELECT t.train_no, t.train_name, t.departure_time, t.arrival_time, t.duration, a.status
            FROM trains t JOIN availability a ON t.train_no = a.train_no
            WHERE t.from_station = ? AND t.to_station = ? AND a.journey_date = ? AND a.class_type = ?
        `;
        const [rows] = await connection.execute(sql, [from, to, date, journeyClass]);
        const formattedTrains = rows.map(row => {
            const status = row.status.toLowerCase();
            let availability = "";
            if (status.includes("available")) availability = `Available (${status.split('-')[1] || 0} seats)`;
            else if (status.includes("regret")) availability = "Regret/No Seats";
            else if (status.includes("waitlist")) availability = `Waitlist (${status.split('-')[1] || 0})`;
            else availability = row.status;
            return {
                no: row.train_no, name: row.train_name, departure: row.departure_time.substring(0, 5),
                arrival: row.arrival_time.substring(0, 5), duration: row.duration, availability: availability
            };
        });
        res.json(formattedTrains);
        await connection.end();
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch data from the database.' });
    }
});

// --- NEW! API Endpoint to Handle Bookings ---
app.post('/api/book', async (req, res) => {
    // Get booking details from the request body
    const { userName, userEmail, userPhone, trainNo, journeyDate, classType } = req.body;

    // Basic validation
    if (!userName || !userEmail || !trainNo || !journeyDate || !classType) {
        return res.status(400).json({ success: false, message: 'Missing required booking information.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const sql = `
            INSERT INTO User_Data (user_name, user_email, user_phone, train_no, journey_date, class_type)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(sql, [userName, userEmail, userPhone, trainNo, journeyDate, classType]);
        
        await connection.end();

        // Send a success response back to the frontend
        res.status(201).json({ 
            success: true, 
            message: 'Booking confirmed!', 
            bookingId: result.insertId 
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to save booking.' });
    }
});

// --- Serve the Frontend ---
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
