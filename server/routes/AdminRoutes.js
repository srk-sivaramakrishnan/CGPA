const express = require('express');
const adminController = require('../controllers/AdminController');

const router = express.Router();

// Admin login route
router.post('/login', adminController.login);

// Route to add faculty
router.post('/addfaculty', adminController.addFaculty);

module.exports = router; 