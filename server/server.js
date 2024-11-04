const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const adminRoutes = require('./routes/AdminRoutes');
const facultyRoutes = require('./routes/FacultyRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins (this can be adjusted in production)
app.use(bodyParser.json());

// Set server timeout to 2 minutes (120000 milliseconds)
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Set timeout for the server
server.setTimeout(120000); // 120 seconds

// Use routes
app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
