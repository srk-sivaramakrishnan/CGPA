const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const fs = require('fs');
const facultyModel = require('../models/FacultyModel');

// Faculty login function
exports.login = async (req, res) => {
    const { facultyId, password } = req.body;

    try {
        const faculty = await facultyModel.findFacultyById(facultyId);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        const match = await bcrypt.compare(password, faculty.Password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { id: faculty.id, facultyId: faculty[`Faculty Id`] }, // Payload
            process.env.SECRET_KEY, // Secret key from .env
            { expiresIn: '1h' } // Token expiration time
        );

        res.status(200).json({ message: 'Login successful', token }); // Return the token
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch faculty profile
exports.getFacultyProfile = async (req, res) => {
    const facultyId = req.user.facultyId; // Get facultyId from the decoded token

    try {
        const faculty = await facultyModel.findFacultyProfile(facultyId);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Exclude Password
        const { Password, ...profile } = faculty;
        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching faculty profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller to handle uploading subjects
exports.uploadSubjects = async (req, res) => {
    try {
        const { subjects } = req.body;
        if (!Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ message: 'No subjects to upload.' });
        }
        await facultyModel.upsertSubjects(subjects);
        res.status(200).json({ message: 'Subjects uploaded successfully.' });
    } catch (error) {
        console.error('Error uploading subjects:', error);
        res.status(500).json({ message: 'Failed to upload subjects. Please try again.' });
    }
};

// Controller to handle uploading grades
exports.uploadGrades = async (req, res) => {
    try {
      const { grades } = req.body;
      await facultyModel.upsertGrades(grades);
      res.status(200).json({ message: 'Grades uploaded successfully.' });
    } catch (error) {
      console.error('Error uploading grades:', error);
      res.status(500).json({ message: 'Failed to upload grades. Please try again.' });
    }
  };

// Controller to fetch cumulative CGPA results with optional filters
exports.getCumulativeCGPA = async (req, res) => {
    const { category, filterValue } = req.query; // Destructure query parameters

    try {
        const results = await facultyModel.getCumulativeCGPA(category, filterValue); // Pass parameters to the model
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching cumulative CGPA results:', error);
        res.status(500).json({ message: error.message });  // Return specific error message
    }
};
