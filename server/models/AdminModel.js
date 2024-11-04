// AdminModel.js
const pool = require('../config/db');
const bcrypt = require('bcrypt'); 

// Function to get admin by admin_id
const getAdminById = async (adminId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM admins WHERE admin_id = ?', [adminId]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    } catch (error) {
        console.error('Error fetching admin from DB:', error);
        throw error;
    }
};

// Function to add faculty
const addFaculty = async (facultyId, name, email, department, facultyClass, section, classAdvisor, batch, password) => {
    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert faculty into the database
        await pool.query('INSERT INTO Faculty (`Faculty Id`, `Name`, `Email`, `Department`, `Class`, `Section`, `Class Advisor`, `Batch`, `Password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [facultyId, name, email, department, facultyClass, section, classAdvisor, batch, hashedPassword]);
    } catch (error) {
        console.error('Error adding faculty to DB:', error);
        throw error; // Propagate the error to the controller
    }
};

module.exports = {
    getAdminById,
    addFaculty,
};