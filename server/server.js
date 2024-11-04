const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const adminRoutes = require('./routes/AdminRoutes'); // Assuming you have admin routes
const facultyRoutes = require('./routes/FacultyRoutes'); // Assuming you have faculty routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).send('Something went wrong!'); // Send a generic error response
});

// Handle 404 (Not Found)
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});
