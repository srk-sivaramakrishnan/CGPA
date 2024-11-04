const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const adminRoutes = require('./routes/AdminRoutes');
const facultyRoutes = require('./routes/FacultyRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'https://kite-faculty-cgpa.vercel.app'  // Replace with your frontend domain
        : '*',  // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions));  // Apply CORS with specified options
app.use(bodyParser.json());

app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
