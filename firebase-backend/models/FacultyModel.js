const { db } = require('../config/firebaseAdmin'); // Import Firestore instance

// Function to find faculty by facultyId
const findFacultyById = async (facultyId) => {
    if (!facultyId) {
        throw new Error('facultyId is required');
    }

    try {
        // Query Firestore to find the faculty by facultyId
        const facultySnapshot = await db.collection('faculty').where('FacultyId', '==', facultyId).get();

        if (facultySnapshot.empty) {
            return null; // No faculty found with this facultyId
        }

        // Return the first document's data (faculty)
        return facultySnapshot.docs[0].data();
    } catch (error) {
        console.error('Error fetching faculty from Firestore:', error);
        throw error;
    }
};

// Function to find faculty profile by facultyId
const findFacultyProfile = async (facultyId) => {
    if (!facultyId) {
        throw new Error('facultyId is required');
    }

    try {
        // Query Firestore to find the faculty by facultyId
        const facultySnapshot = await db.collection('faculty').where('FacultyId', '==', facultyId).get();

        if (facultySnapshot.empty) {
            return null; // No faculty found with this facultyId
        }

        // Return the first document's data (faculty)
        return facultySnapshot.docs[0].data();
    } catch (error) {
        console.error('Error fetching faculty profile from Firestore:', error);
        throw error;
    }
};

// Function to insert or update subjects
const upsertSubjects = async (subjects) => {
    const batch = db.batch(); // Create a batch to perform multiple writes

    // Loop through each subject and set it in Firestore
    subjects.forEach(subject => {
        const subjectRef = db.collection('subjects').doc(subject.subjectCode); // Use subjectCode as the document ID
        batch.set(subjectRef, {
            'Subject Name': subject.subjectName,
            'Credits': subject.credits
        }, { merge: true }); // Merge ensures it updates if it already exists
    });

    // Commit the batch
    await batch.commit();
};

// Function to insert or update grades
const upsertGrades = async (grades) => {
    const batch = db.batch(); // Create a batch to perform multiple writes

    grades.forEach(gradeData => {
        gradeData.subjectCodes.forEach((subjectCode, index) => {
            const gradeRef = db.collection('grades').doc(`${gradeData.rollNo}_${subjectCode}`); // Use rollNo and subjectCode as unique document ID

            // Set the grade data in Firestore
            batch.set(gradeRef, {
                'Roll No': gradeData.rollNo,
                'Register Number': gradeData.registerNumber,
                'Student Name': gradeData.studentName,
                'Subject Code': subjectCode,
                'Grade': gradeData.grades[index],
                'Semester': gradeData.semester,
                'Department': gradeData.department,
                'Section': gradeData.section,
                'Batch': gradeData.batch
            }, { merge: true }); // Merge ensures that existing records are updated
        });
    });

    // Commit the batch
    await batch.commit();
};

// Function to upsert GPA data in `cgpa_calculation`
const upsertCgpaCalculation = async (gpaData) => {
    const batch = db.batch(); // Create a batch for multiple writes

    try {
        for (const data of gpaData) {
            const docRef = db.collection('cgpa_calculation').doc(`${data.rollNo}_${data.registerNumber}_${data.semester}`); // Use a unique document ID

            // Set the GPA data in Firestore, merging if the document already exists
            batch.set(docRef, {
                'Roll No': data.rollNo,
                'Register Number': data.registerNumber,
                'Student Name': data.studentName,
                'Semester': data.semester,
                'Total Score': parseFloat(data.totalScore.toFixed(2)),
                'Total Credits': data.totalCredits,
                'Department': data.department,
                'Section': data.section,
                'Batch': data.batch
            }, { merge: true }); // Merge ensures that existing data is updated without overwriting the whole document
        }

        // Commit the batch to apply all changes
        await batch.commit();

        return { success: true };
    } catch (error) {
        console.error('Error upserting GPA data in Firestore:', error);
        throw error; // Propagate the error to be handled by the controller
    }
};

// Function to get cumulative CGPA data from `cgpa_calculation` and aggregate by Roll No and Register Number
const getCumulativeCGPA = async (category, filterValue, department, section, batch) => {
    try {
        const cgpaCollectionRef = db.collection('cgpa_calculation');
        let query = cgpaCollectionRef;

        // Apply filters based on category
        if (category === 'rollNo' && filterValue) {
            query = query.where('Roll No', '==', filterValue);
            console.log(`Fetching data for Roll No: ${filterValue}`);  // Debugging log
        } else if (category === 'registerNo' && filterValue) {
            // Convert the filter value to a number for Register Number
            const registerNumber = Number(filterValue);
            console.log(`Fetching data for Register Number: ${registerNumber}`);  // Debugging log
            query = query.where('Register Number', '==', registerNumber);
        } else if (category === 'classwise') {
            if (department) query = query.where('Department', '==', department);
            if (section) query = query.where('Section', '==', section);
            if (batch) query = query.where('Batch', '==', batch);
        }

        // Log the query details before executing it
        console.log('Firestore query:', query);

        // Fetch the data based on the query
        const querySnapshot = await query.get();
        console.log('Query snapshot:', querySnapshot);  // Log query snapshot for debugging

        // Aggregate the data by Roll No and Register Number
        const aggregatedData = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Fetched document:', data); // Log the document to see its structure
        
            const rollNo = data['Roll No'];
            const registerNumber = data['Register Number'];
            const totalScore = data['Total Score'];
            const totalCredits = data['Total Credits'];
        
            if (!rollNo || !registerNumber) return; // Skip if these fields are missing
        
            const key = `${rollNo}_${registerNumber}`;
            const score = totalScore != null ? parseFloat(totalScore) : 0;
            const credits = totalCredits != null ? parseFloat(totalCredits) : 0;
        
            if (aggregatedData[key]) {
                aggregatedData[key].totalScore += score;
                aggregatedData[key].totalCredits += credits;
            } else {
                aggregatedData[key] = {
                    rollNo,
                    registerNumber,
                    studentName: data['Student Name'],
                    totalScore: score,
                    totalCredits: credits,
                    department: data.Department,
                    section: data.Section,
                    batch: data.Batch
                };
            }
        });

        // Calculate CGPA
        const cumulativeCGPA = Object.values(aggregatedData).map((student) => ({
            ...student,
            cgpa: student.totalCredits > 0 ? (student.totalScore / student.totalCredits).toFixed(2) : 'N/A'
        }));

        return cumulativeCGPA;
    } catch (error) {
        console.error('Error fetching cumulative CGPA:', error);
        throw error;
    }
};


module.exports = {
    findFacultyById,
    findFacultyProfile,
    upsertSubjects,
    upsertGrades,
    upsertCgpaCalculation,
    getCumulativeCGPA, 
};
