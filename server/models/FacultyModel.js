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

// Function to insert or update subjects
const upsertSubjects = async (subjects) => {
    const query = `
      INSERT INTO Subjects (\`Subject Code\`, \`Subject Name\`, Credits)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        \`Subject Name\` = VALUES(\`Subject Name\`), 
        Credits = VALUES(Credits);
    `;
    const values = subjects.map(subject => [subject.subjectCode, subject.subjectName, subject.credits]);
    return pool.query(query, [values]);
};

  
  // Function to insert or update grades
  const upsertGrades = async (grades) => {
    const query = `
      INSERT INTO Grades (\`Roll No\`, \`Register Number\`, \`Student Name\`, \`Subject Code\`, Grade, Semester, Department, Year, Section, Batch)
      VALUES ?
      ON DUPLICATE KEY UPDATE Grade = VALUES(Grade);
    `;
    const values = grades.map(grade => [
      grade.rollNo,
      grade.registerNumber,
      grade.studentName,
      grade.subjectCode,
      grade.grade,
      grade.semester,
      grade.department,
      grade.year,
      grade.section,
      grade.batch
    ]);
    return pool.query(query, [values]);
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
    upsertSubjects,
    upsertGrades,
    getCumulativeCGPA, // Export the new function
};