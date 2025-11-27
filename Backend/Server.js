require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const authRoutes = require('./routes/auth');
const animRoutes = require('./routes/animations');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/animations', animRoutes);

// static serving for results in dev
// app.use('/storage', express.static('storage'));
app.use("/results", express.static(path.join(__dirname, "storage/results")));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
