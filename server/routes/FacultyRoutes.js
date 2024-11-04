const express = require('express');
const FacultyController = require('../controllers/FacultyController');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');

// Change upload destination to /tmp
const upload = multer({ dest: '/tmp/' });

const router = express.Router();

// Faculty login route
router.post('/login', FacultyController.login);

// Route to get faculty profile
router.get('/profile', authenticateToken, FacultyController.getFacultyProfile);

// Route to upload and process Excel file
router.post('/upload-cgpa', authenticateToken, upload.single('file'), FacultyController.uploadCGPAData);

// Route to save CGPA results
router.post('/save-cgpa-results', authenticateToken, FacultyController.saveCGPAResults);

// Route for getting CGPA calculation
router.get('/cgpa-calculation', authenticateToken, FacultyController.getCumulativeCGPA);

module.exports = router;
