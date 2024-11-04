import React, { useState } from 'react';
import axios from 'axios';
import baseURL from '../../auth/connection'; // Import the base URL

const AddFaculty = () => {
    const [facultyId, setFacultyId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [facultyClass, setFacultyClass] = useState('');
    const [section, setSection] = useState('');
    const [classAdvisor, setClassAdvisor] = useState('');
    const [batch, setBatch] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddFaculty = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        try {
            const { data } = await axios.post(`${baseURL}/admin/addfaculty`, {
                faculty_id: facultyId,
                name: name,
                email: email,
                department: department,
                class: facultyClass,
                section: section,
                class_advisor: classAdvisor,
                batch: batch,
                password: password,
            });

            // Log the response for debugging
            console.log(data); 

            // Handle successful addition
            setSuccess('Faculty added successfully!');
            setError('');
            // Optionally reset the form fields
            setFacultyId('');
            setName('');
            setEmail('');
            setDepartment('');
            setFacultyClass('');
            setSection('');
            setClassAdvisor('');
            setBatch('');
            setPassword('');

        } catch (err) {
            if (err.response) {
                // Handle error response from the server
                setError(err.response.data.message);
                setSuccess('');
            } else {
                // Handle other errors (network issues, etc.)
                setError('An error occurred. Please try again.');
                setSuccess('');
            }
        }
    };

    return (
        <div className="add-faculty-container">
            <h2>Add Faculty</h2>
            <form onSubmit={handleAddFaculty}>
                <div>
                    <label htmlFor="facultyId">Faculty ID:</label>
                    <input type="text" id="facultyId" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="department">Department:</label>
                    <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                        <option value="">Select Department</option>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="CSBS">CSBS</option>
                        <option value="AI&DS">AI&DS</option>
                        <option value="MECH">MECH</option>
                        <option value="ECE">ECE</option>
                        <option value="CYS">CYS</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="class">Class:</label>
                    <select id="class" value={facultyClass} onChange={(e) => setFacultyClass(e.target.value)} required>
                        <option value="">Select Class</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="section">Section:</label>
                    <select id="section" value={section} onChange={(e) => setSection(e.target.value)} required>
                        <option value="">Select Section</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="No Section">No Section</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="classAdvisor">Class Advisor:</label>
                    <select id="classAdvisor" value={classAdvisor} onChange={(e) => setClassAdvisor(e.target.value)} required>
                        <option value="">Select Class Advisor</option>
                        <option value="Class Advisor">Class Advisor</option>
                        <option value="Mentor">Mentor</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="batch">Batch:</label>
                    <select id="batch" value={batch} onChange={(e) => setBatch(e.target.value)} required>
                        <option value="">Select Batch</option>
                        <option value="2021-2025">2021-2025</option>
                        <option value="2022-2026">2022-2026</option>
                        <option value="2023-2027">2023-2027</option>
                        <option value="2024-2028">2024-2028</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Add Faculty</button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </form>
        </div>
    );
};

export default AddFaculty;
