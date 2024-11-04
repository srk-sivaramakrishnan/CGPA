// AdminController.js
const bcrypt = require('bcrypt');
const adminModel = require('../models/AdminModel');

// Admin login function
exports.login = async (req, res) => {
    const { admin_id, password } = req.body;

    try {
        const admin = await adminModel.getAdminById(admin_id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.status(200).json({ message: 'Login successful', admin });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Function to add a faculty member
exports.addFaculty = async (req, res) => {
    const { faculty_id, name, email, department, class: facultyClass, section, class_advisor, batch, password } = req.body;

    try {
        // Call the model function to add faculty
        await adminModel.addFaculty(faculty_id, name, email, department, facultyClass, section, class_advisor, batch, password);
        
        res.status(201).json({ message: 'Faculty added successfully!' });
    } catch (error) {
        console.error('Error adding faculty:', error);
        res.status(500).json({ message: 'Error adding faculty' });
    }
};