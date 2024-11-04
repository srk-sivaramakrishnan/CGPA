const pool = require('../config/db'); // Adjust the path as necessary

// Function to get faculty by facultyId
const findFacultyById = async (facultyId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Faculty WHERE `Faculty Id` = ?', [facultyId]);
        if (rows.length === 0) {
            return null; // Return null if no faculty is found
        }
        return rows[0]; // Return the first matching faculty record
    } catch (error) {
        console.error('Error fetching faculty from DB:', error);
        throw error; // Propagate the error
    }
};

// Faculty Profile
const findFacultyProfile = async (facultyId) => {
    try {
        const [rows] = await pool.query('SELECT `Faculty Id`, `Name`, `Email`, `Department`, `Class`, `Section`, `Class Advisor`, `Batch` FROM Faculty WHERE `Faculty Id` = ?', [facultyId]);
        if (rows.length === 0) {
            return null; // Return null if no faculty is found
        }
        return rows[0]; // Return the first matching faculty record
    } catch (error) {
        console.error('Error fetching faculty from DB:', error);
        throw error; // Propagate the error
    }
};

// Insert subjects into the Subjects table
const insertSubjects = async (subjectCodes, subjectNames, credits) => {
    try {
        for (let i = 0; i < subjectCodes.length; i++) {
            const subjectCode = subjectCodes[i];
            const subjectName = subjectNames[i];
            const credit = credits[i];

            await pool.query(
                'INSERT IGNORE INTO Subjects (`Subject Code`, `Subject Name`, `Credits`) VALUES (?, ?, ?)',
                [subjectCode, subjectName, credit]
            );
        }
    } catch (error) {
        console.error('Error inserting subjects into DB:', error);
        throw error;
    }
};

// Upsert grades into the Grades table
const upsertGrades = async (rollNo, registerNumber, studentName, subjectCodes, grades, semester, department, year, section, batch) => {
    try {
        for (let j = 0; j < grades.length; j++) {
            let grade = grades[j];
            const subjectCode = subjectCodes[j];

            // Check if grade is valid
            if (typeof grade !== 'string' || grade.length > 5) {
                console.error(`Invalid grade value: ${grade}`);
                continue; // Skip if grade is invalid
            }

            await pool.query(
                `INSERT INTO Grades (\`Roll No\`, \`Register Number\`, \`Student Name\`, \`Subject Code\`, \`Grade\`, \`Semester\`, \`Department\`, \`Year\`, \`Section\`, \`Batch\`) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE \`Grade\` = VALUES(\`Grade\`)`,
                [rollNo, registerNumber, studentName, subjectCode, grade, semester, department, year, section, batch]
            );
        }
    } catch (error) {
        console.error('Error inserting/updating grades in DB:', error);
        throw error;
    }
};

// Upsert CGPA results into the cgpa_results table
const upsertCGPAResults = async (rollNo, registerNumber, studentName, department, year, section, batch, cgpa) => {
    try {
        // Check if the entry already exists
        const [existing] = await pool.query(
            `SELECT * FROM cgpa_results WHERE \`Roll No\` = ? AND \`Register Number\` = ?`,
            [rollNo, registerNumber]
        );

        if (existing.length > 0) {
            // Update the existing entry without GPA
            await pool.query(
                `UPDATE cgpa_results 
                SET \`CGPA\` = ? 
                WHERE \`Roll No\` = ? AND \`Register Number\` = ?`,
                [cgpa, rollNo, registerNumber]
            );
        } else {
            // Insert a new entry without GPA
            await pool.query(
                `INSERT INTO cgpa_results (
                    \`Roll No\`, 
                    \`Register Number\`, 
                    \`Student Name\`, 
                    \`Department\`, 
                    \`Year\`, 
                    \`Section\`, 
                    \`Batch\`, 
                    \`CGPA\`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [rollNo, registerNumber, studentName, department, year, section, batch, cgpa]
            );
        }
    } catch (error) {
        console.error('Error inserting/updating CGPA results in DB:', error);
        throw error;
    }
};

// Upsert total scores into the cgpa_calculation table
const upsertTotalScores = async (rollNo, registerNumber, studentName, totalScore, totalCredits, semester) => {
    try {
        totalScore = totalScore ?? 0; 
        totalCredits = totalCredits ?? 0; 

        // Check if a record exists for the given roll number, register number, and semester
        const [existing] = await pool.query(
            `SELECT * FROM cgpa_calculation 
             WHERE \`Roll No\` = ? AND \`Register Number\` = ? AND \`Semester\` = ?`,
            [rollNo, registerNumber, semester]
        );

        if (existing.length > 0) {
            // Update the existing entry for the same semester
            await pool.query(
                `UPDATE cgpa_calculation 
                SET \`Total Score\` = ?, \`Total Credits\` = ? 
                WHERE \`Roll No\` = ? AND \`Register Number\` = ? AND \`Semester\` = ?`,
                [totalScore, totalCredits, rollNo, registerNumber, semester]
            );
        } else {
            // Insert a new entry, include Semester
            await pool.query(
                `INSERT INTO cgpa_calculation (
                    \`Roll No\`, 
                    \`Register Number\`, 
                    \`Student Name\`, 
                    \`Total Score\`, 
                    \`Total Credits\`, 
                    \`Semester\`) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [rollNo, registerNumber, studentName, totalScore, totalCredits, semester]
            );
        }
    } catch (error) {
        console.error('Error inserting/updating total scores in DB:', error);
        throw error;
    }
};

// Fetch CGPA results with calculated CGPA for each student based on cumulative semester scores and credits
const getCumulativeCGPA = async (category, filterValue) => {
    try {
        // Adjusted query to fetch only necessary columns
        let query = `
            SELECT 
                \`Roll No\`, 
                \`Register Number\`, 
                \`Student Name\`, 
                CASE 
                    WHEN SUM(\`Total Credits\`) > 0 THEN ROUND(SUM(\`Total Score\`) / SUM(\`Total Credits\`), 2) 
                    ELSE 0 
                END AS CGPA
            FROM 
                cgpa_calculation
        `;

        if (category && filterValue) {
            const validCategories = {
                rollNo: '`Roll No`',
                registerNo: '`Register Number`'
            };

            if (validCategories[category]) {
                query += ` WHERE ${validCategories[category]} = ?`;
            } else {
                throw new Error('Invalid category');
            }
        }

        query += ` GROUP BY \`Roll No\`, \`Register Number\`, \`Student Name\``;

        const [rows] = await pool.query(query, [filterValue]);
        return rows;
    } catch (error) {
        console.error('Error fetching cumulative CGPA:', error);
        throw new Error('Error fetching cumulative CGPA data');
    }
};



// Export the functions
module.exports = {
    findFacultyById,
    findFacultyProfile,
    insertSubjects,
    upsertGrades,
    upsertCGPAResults,
    upsertTotalScores,
    getCumulativeCGPA, // Export the new function
};