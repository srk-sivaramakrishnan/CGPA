import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../auth/connection';
import '../../styles/Faculty/CalculatingCGPA.css';

const CalculatingCGPA = () => {
    const [error, setError] = useState('');
    const [gpaResults, setGpaResults] = useState([]);

    useEffect(() => {
        const fetchGPAData = async () => {
            try {
                const response = await axios.get(`${baseURL}/faculty/cgpa/data`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
                    }
                });
                calculateGPA(response.data); // Calculate GPA directly after fetching data
            } catch (error) {
                console.error('Error fetching GPA data:', error);
                setError('Failed to fetch GPA data');
            }
        };

        fetchGPAData(); // Call updated function
    }, []);

    const calculateGPA = (data) => {
        const gradePoints = {
            'O': 10,
            'A+': 9,
            'A': 8,
            'B+': 7,
            'B': 6,
            'C': 5,
            'U': 0,
        };

        const results = {};

        data.forEach(record => {
            const { rollNo, credits, grade, semester } = record; // Include semester
            const points = gradePoints[grade] || 0; // Default to 0 if grade is not found

            if (!results[rollNo]) {
                results[rollNo] = { totalScore: 0, totalCredits: 0, semesters: new Set() }; // Add a Set for semesters
            }

            results[rollNo].totalScore += points * credits; // Calculate weighted score
            results[rollNo].totalCredits += credits; // Sum credits
            results[rollNo].semesters.add(semester); // Store unique semesters
        });

        // Calculate GPA for each student
        const gpaArray = Object.entries(results).map(([rollNo, { totalScore, totalCredits, semesters }]) => ({
            rollNo,
            gpa: totalCredits > 0 ? (totalScore / totalCredits).toFixed(2) : 0, // Change to GPA
            totalScore,
            totalCredits,
            semesterCount: semesters.size // Count unique semesters
        }));

        setGpaResults(gpaArray); // Update to use new variable
    };

    return (
        <div className="cgpa-container">
            <h2>GPA Data</h2> {/* Change heading to GPA */}
            {error && <p className="error-message">{error}</p>}
            {gpaResults.length > 0 ? ( // Update to use new variable
                <table className="cgpa-table">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Total Score</th>
                            <th>Total Credits</th>
                            <th>GPA</th> {/* Change to GPA */}
                            <th>Semester Count</th> {/* New column for semester count */}
                        </tr>
                    </thead>
                    <tbody>
                        {gpaResults.map((result, index) => (
                            <tr key={index}>
                                <td>{result.rollNo}</td>
                                <td>{result.totalScore}</td>
                                <td>{result.totalCredits}</td>
                                <td>{result.gpa}</td> {/* Change to GPA */}
                                <td>{result.semesterCount}</td> {/* Display semester count */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No GPA data available.</p> 
            )}
        </div>
    );
};

export default CalculatingCGPA;
