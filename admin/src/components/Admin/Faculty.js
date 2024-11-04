import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../../styles/Admin/Faculty.css'; // Import your CSS styles for the Faculty component

function Faculty() {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleAddFaculty = () => {
        navigate('/dashboard/add-faculty'); // Navigate to AddFaculty
    };

    return (
        <div className="faculty-container">
            <h1>Faculty</h1>
            <button className="add-faculty-button" onClick={handleAddFaculty}>
                Add Faculty
            </button>
        </div>
    );
}

export default Faculty;
