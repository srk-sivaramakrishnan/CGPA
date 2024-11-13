// models/AdminModel.js
const { db } = require('../config/firebaseAdmin'); // Import Firestore instance

// Function to get admin by admin_id
const getAdminById = async (adminId) => {
    if (!adminId) {
        throw new Error('admin_id is required');
    }

    try {
        const adminSnapshot = await db.collection('admin').where('admin_id', '==', adminId).get();

        if (adminSnapshot.empty) {
            return null; // No admin found with this ID
        }
        const adminData = adminSnapshot.docs[0].data();

        // Trim any spaces in the password field
        adminData.password = adminData[' password']?.trim();  // Access and trim the password field

        return adminData;
    } catch (error) {
        console.error('Error fetching admin from Firestore:', error);
        throw error;
    }
};

// Function to add faculty
const addFaculty = async (facultyId, name, email, department, facultyClass, section, classAdvisor, batch, hashedPassword) => {
    try {
        // Prepare the faculty data object for Firestore
        const facultyData = {
            FacultyId: facultyId,        // Faculty ID
            Name: name,                  // Faculty Name
            Email: email,                // Email
            Department: department,      // Department
            Class: facultyClass,         // Class (could be "First Year", etc.)
            Section: section,            // Section (could be "A", "B", etc.)
            ClassAdvisor: classAdvisor,  // Class Advisor (yes/no or faculty name)
            Batch: batch,                // Batch (e.g., "2022-2026")
            Password: hashedPassword,    // Hashed Password
            created_at: new Date()       // Optional: Timestamp when the faculty was added
        };

        // Insert faculty data into Firestore collection 'faculty'
        await db.collection('Faculty').add(facultyData);

        console.log('Faculty added successfully!');
    } catch (error) {
        console.error('Error adding faculty to Firestore:', error);
        throw error; // Propagate the error to the controller
    }
};

module.exports = {
    getAdminById,
    addFaculty,
};
