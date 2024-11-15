const bcrypt = require('bcrypt');
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

        // Return success message with facultyId
        res.status(200).json({ message: 'Login successful', facultyId });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch faculty profile without token authentication
exports.getFacultyProfile = async (req, res) => {
    const facultyId = req.query.facultyId || req.body.facultyId; // Get facultyId from query or body

    if (!facultyId) {
        return res.status(400).json({ message: 'Faculty ID is required' });
    }

    try {
        const faculty = await facultyModel.findFacultyProfile(facultyId);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Exclude Password field
        const { Password, ...profile } = faculty;
        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching faculty profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller to handle uploading subjects without token authentication
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

// Function to upload grades
exports.uploadGrades = async (req, res) => {
    const { grades } = req.body;

    if (!grades || grades.length === 0) {
        return res.status(400).json({ message: 'No grades provided' });
    }

    try {
        await facultyModel.upsertGrades(grades); // Call the model function
        res.status(200).json({ message: 'Grades upserted successfully' });
    } catch (error) {
        console.error('Error uploading grades:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller function to upsert GPA data in `cgpa_calculation`
exports.storeCgpaCalculation = async (req, res) => {
    const { gpaData } = req.body;
  
    try {
      const result = await facultyModel.upsertCgpaCalculation(gpaData);
  
      if (result.success) {
        res.status(200).json({ message: 'GPA results stored successfully!' });
      } else {
        res.status(500).json({ error: 'Failed to store GPA results. Please try again.' });
      }
    } catch (error) {
      console.error('Error in FacultyController:', error);
      res.status(500).json({ error: 'An error occurred while storing GPA results.' });
    }
};

// Controller to fetch cumulative CGPA results with optional fillters
exports.getCumulativeCGPA = async (req, res) => {
    const { category, filterValue, department, section, batch } = req.query; // Destructure query parameters

    try {
        const results = await facultyModel.getCumulativeCGPA(
            category, 
            filterValue, 
            department, 
            section, 
            batch
        );
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching cumulative CGPA results:', error);
        res.status(500).json({ message: error.message });
    }
};
