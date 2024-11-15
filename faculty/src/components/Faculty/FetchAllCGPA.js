import React, { useEffect, useState } from 'react';
import baseURL from '../../auth/connection';

function FetchAllCGPA() {
    const [cgpaData, setCgpaData] = useState([]);
    const [loading, setLoading] = useState(true);

// Fetch data from the backend API
useEffect(() => {
    async function fetchCGPA() {
        try {
            // No need to retrieve the token as it's no longer required
            // Make the fetch request without the Authorization header
            const response = await fetch(`${baseURL}/faculty/cgpa-calculation`, {
                headers: {
                    'Content-Type': 'application/json', // Only Content-Type header needed
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Ensure `data` is an array before setting it to state
            if (Array.isArray(data)) {
                setCgpaData(data);
            } else {
                console.error("Expected an array but received:", data);
                setCgpaData([]);
            }
        } catch (error) {
            console.error('Error fetching CGPA data:', error);
        } finally {
            setLoading(false);
        }
    }

    fetchCGPA();
}, []);


    // Show a loading spinner while data is being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Cumulative CGPA Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Register Number</th>
                        <th>Student Name</th>
                        <th>CGPA</th>
                    </tr>
                </thead>
                <tbody>
                    {cgpaData.length > 0 ? (
                        cgpaData.map((student, index) => (
                            <tr key={index}>
                                <td>{student['Roll No']}</td>
                                <td>{student['Register Number']}</td>
                                <td>{student['Student Name']}</td>
                                <td>{student.CGPA}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default FetchAllCGPA;
