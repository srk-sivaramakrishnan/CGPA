const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const xlsx = require('xlsx');
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

// Upload and process CGPA Excel file
exports.uploadCGPAData = async (req, res) => {
    const filePath = req.file.path;
    const { semester, department, year, section, batch } = req.body;

    console.time('ExcelProcessing'); // Start timer
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    try {
        const subjectCodes = data[0].slice(3);
        const subjectNames = data[1].slice(3);
        const credits = data[2].slice(3);

        // Validate subject information
        if (subjectCodes.length === 0 || subjectNames.length === 0 || credits.length === 0) {
            return res.status(400).json({ message: 'Subject information is incomplete.' });
        }

        // Call the insertSubjects function from FacultyModel
        await facultyModel.insertSubjects(subjectCodes, subjectNames, credits);

        // Process each student's data
        for (let i = 3; i < data.length; i++) {
            const [rollNo, registerNumber, studentName, ...grades] = data[i];

            // Validate required student information
            if (rollNo && registerNumber && studentName) {
                // Call upsertGrades from FacultyModel
                await facultyModel.upsertGrades(
                    rollNo,
                    registerNumber,
                    studentName,
                    subjectCodes,
                    grades,
                    semester,
                    department,
                    year,
                    section,
                    batch
                );
            } else {
                console.warn(`Missing required information for student at row ${i + 1}:`, data[i]);
            }
        }

        // Delete the uploaded file after processing
        fs.unlinkSync(filePath);
        
        console.timeEnd('ExcelProcessing'); // Log duration
        res.status(200).json({ message: 'Excel data processed and stored successfully' });
    } catch (error) {
        console.error('Error processing Excel data:', error);
        res.status(500).json({ message: 'Error processing Excel file', error: error.message });
    }
};

// Save CGPA results and total scores
exports.saveCGPAResults = async (req, res) => {
    const results = req.body; // Get the results from the request body

    console.log("Received results:", results); // Log received results

    try {
        for (const result of results) {
            const { 
                rollNo, 
                registerNumber, 
                studentName, 
                totalScore, 
                totalCredits, 
                semester, // Add semester here
                department, 
                year, 
                section, 
                batch, 
                cgpa 
            } = result;

            // Check if totalScore is defined
            if (totalScore == null || totalCredits == null) {
                console.error("Total Score or Total Credits is null or undefined:", { totalScore, totalCredits });
                return res.status(400).json({ message: 'Total Score and Total Credits are required.' });
            }

            // Upsert CGPA results (store CGPA only)
            await facultyModel.upsertCGPAResults(
                rollNo,
                registerNumber,
                studentName,
                department, // Ensure this is defined
                year,       // Ensure this is defined
                section,    // Ensure this is defined
                batch,      // Ensure this is defined
                cgpa        // Ensure this is defined
            );

            // Upsert total scores (including total credits)
            await facultyModel.upsertTotalScores(
                rollNo,
                registerNumber,
                studentName,
                totalScore,
                totalCredits,
                semester // Pass the semester to this function
            );
        }

        res.status(200).json({ message: 'CGPA results and total scores saved successfully' });
    } catch (error) {
        console.error('Error saving CGPA results and total scores:', error);
        res.status(500).json({ message: 'Error saving CGPA results and total scores' });
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
