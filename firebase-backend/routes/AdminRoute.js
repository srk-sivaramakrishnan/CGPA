// routes/AdminRoute.js
const express = require('express');
const adminController = require('../controllers/AdminController'); // Adjust the path if needed

const router = express.Router();

// Admin login route
router.post('/login', adminController.login); 

// Route to add faculty
router.post('/addfaculty', adminController.addFaculty);

module.exports = router;
