const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const adminRoutes = require('./routes/AdminRoute'); // Admin routes
const facultyRoutes = require('./routes/FacultyRoute');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse JSON body

// Use routes
app.use('/admin', adminRoutes);  // Make sure you're correctly using this route
app.use('/faculty', facultyRoutes);  // If you're also using other routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).send('Something went wrong!'); // Send a generic error response
});

// Handle 404 (Not Found)
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
