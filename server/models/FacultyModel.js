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

// Function to upsert grades into the database
const upsertGrades = async (grades) => {
  const insertQueries = grades.map((gradeData) => {
      return gradeData.subjectCodes.map((subjectCode, index) => {
          return [
              gradeData.rollNo,
              gradeData.registerNumber,
              gradeData.studentName,
              subjectCode,
              gradeData.grades[index],
              gradeData.semester,
              gradeData.department,
              gradeData.section,
              gradeData.batch,
          ];
      });
  }).flat();

  const insertStatement = `
      INSERT INTO Grades (
          \`Roll No\`, \`Register Number\`, \`Student Name\`, \`Subject Code\`, \`Grade\`,
          \`Semester\`, \`Department\`, \`Section\`, \`Batch\`
      ) VALUES ? 
      ON DUPLICATE KEY UPDATE 
          \`Grade\` = VALUES(\`Grade\`),
          \`Semester\` = VALUES(\`Semester\`),
          \`Department\` = VALUES(\`Department\`),
          \`Section\` = VALUES(\`Section\`),
          \`Batch\` = VALUES(\`Batch\`);
  `;

  try {
      await pool.query(insertStatement, [insertQueries]);
  } catch (error) {
      console.error('Error upserting grades into DB:', error);
      throw error; // Propagate the error for the controller to handle
  }
};

// Upsert function to store or update GPA data in `cgpa_calculation`
const upsertCgpaCalculation = async (gpaData) => {
    try {
      for (const data of gpaData) {
        // Check if entry with the same Roll No, Register Number, and Semester exists
        const [existingRecord] = await pool.query(
          `SELECT * FROM cgpa_calculation WHERE \`Roll No\` = ? AND \`Register Number\` = ? AND \`Semester\` = ?`,
          [data.rollNo, data.registerNumber, data.semester]
        );
  
        if (existingRecord.length > 0) {
          // If exists, update the existing record
          await pool.query(
            `UPDATE cgpa_calculation
             SET \`Total Score\` = ?, \`Total Credits\` = ?, \`Department\` = ?, \`Section\` = ?, \`Batch\` = ?
             WHERE \`Roll No\` = ? AND \`Register Number\` = ? AND \`Semester\` = ?`,
            [
              parseFloat(data.totalScore.toFixed(2)),
              data.totalCredits,  // Ensure credits are whole if they don’t require decimals
              data.department,
              data.section,
              data.batch,
              data.rollNo,
              data.registerNumber,
              data.semester,
            ]
          );          
        } else {
          // If no record found, insert a new entry
          await pool.query(
            `INSERT INTO cgpa_calculation (\`Roll No\`, \`Register Number\`, \`Student Name\`, \`Semester\`, \`Total Score\`, \`Total Credits\`, \`Department\`, \`Section\`, \`Batch\`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.rollNo,
              data.registerNumber,
              data.studentName,
              data.semester,
              data.totalScore,
              data.totalCredits,
              data.department,  // Insert department
              data.section,     // Insert section
              data.batch,       // Insert batch
            ]
          );
        }
      }
  
      return { success: true };
    } catch (error) {
      console.error('Error upserting GPA data:', error);
      throw error;
    }
  };
  
// Fetch CGPA results with calculated CGPA for each student based on cumulative semester scores and cred.its
const getCumulativeCGPA = async (category, filterValue, department, section, batch) => {
    try {
        // Adjusted query to fetch CGPA results
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
            if (category === 'rollNo' || category === 'registerNo') {
                const validCategories = {
                    rollNo: '`Roll No`',
                    registerNo: '`Register Number`'
                };

                query += ` WHERE ${validCategories[category]} = ?`;
            } else if (category === 'classwise') {
                query += ` WHERE department = ? AND section = ? AND batch = ?`;
            } else {
                throw new Error('Invalid category');
            }
        }

        query += ` GROUP BY \`Roll No\`, \`Register Number\`, \`Student Name\``;

        const params = category === 'classwise' 
            ? [department, section, batch] 
            : [filterValue];

        const [rows] = await pool.query(query, params);
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
    upsertCgpaCalculation,
    getCumulativeCGPA, // Export the new function
};