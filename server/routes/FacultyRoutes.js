const express = require('express');
const FacultyController = require('../controllers/FacultyController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Faculty login route
router.post('/login', FacultyController.login);

// Route to get faculty profile
router.get('/profile', FacultyController.getFacultyProfile);

// Route to upload subjects
router.post('/upload-subjects', authenticateToken, FacultyController.uploadSubjects);

// Route to upload grades
router.post('/upload-grades', authenticateToken, FacultyController.uploadGrades);

// Endpoint to store GPA results in `cgpa_calculation` table
router.post('/store-cgpa-calculation',  authenticateToken, FacultyController.storeCgpaCalculation);

// Route for getting CGPA calculation
router.get('/cgpa-calculation', authenticateToken, FacultyController.getCumulativeCGPA);

module.exports = router;