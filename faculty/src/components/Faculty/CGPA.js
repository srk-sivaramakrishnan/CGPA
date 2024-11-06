import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseURL from '../../auth/connection';
import '../../styles/Faculty/CGPA.css';

function CGPA() {
    const navigate = useNavigate();

    // State variables for search
    const [searchCategory, setSearchCategory] = useState('rollNo'); // Default search category
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState([]); // State for storing fetched results
    const [error, setError] = useState(''); // State for handling errors

    // State variables for classwise search
    const [department, setDepartment] = useState('');
    const [facultyClass, setFacultyClass] = useState('');
    const [section, setSection] = useState('');
    const [batch, setBatch] = useState('');

    const handleManageCGPAClick = () => {
        navigate('/dashboard/cgpa/manage'); // Navigate to Manage CGPA page
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            let params = { category: searchCategory, filterValue: searchValue };

            // Add additional filters for classwise search
            if (searchCategory === 'classwise') {
                params = {
                    ...params,
                    department,
                    facultyClass,
                    section,
                    batch
                };
            }

            const response = await axios.get(`${baseURL}/faculty/cgpa-calculation`, {
                params: params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setResults(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching CGPA results:', error);
            setError('Failed to fetch CGPA results.');
        }
    };

    return (
        <div className="cgpa-container">
            <div className="cgpa-header">
                <h2>CGPA</h2>
                <button className="cgpa-control-button" onClick={handleManageCGPAClick}>
                    Manage CGPA
                </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="form-group">
                    <label htmlFor="search-category">Select Category:</label>
                    <select
                        id="search-category"
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                    >
                        <option value="rollNo">Roll No</option>
                        <option value="registerNo">Register No</option>
                        <option value="classwise">Classwise</option>
                    </select>
                </div>

                {searchCategory !== 'classwise' && (
                    <div className="form-group">
                        <label htmlFor="search-value">
                            Enter {searchCategory === 'rollNo' ? 'Roll No' : 'Register No'}:
                        </label>
                        <input
                            type="text"
                            id="search-value"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            required
                        />
                    </div>
                )}

                {searchCategory === 'classwise' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="department">Department:</label>
                            <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                <option value="">Select Department</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="ME">ME</option>
                                <option value="CE">CE</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="facultyClass">Class:</label>
                            <select id="facultyClass" value={facultyClass} onChange={(e) => setFacultyClass(e.target.value)} required>
                                <option value="">Select Class</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="section">Section:</label>
                            <select id="section" value={section} onChange={(e) => setSection(e.target.value)} required>
                                <option value="">Select Section</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="batch">Batch:</label>
                            <select id="batch" value={batch} onChange={(e) => setBatch(e.target.value)} required>
                                <option value="">Select Batch</option>
                                <option value="2021-2025">2021-2025</option>
                                <option value="2022-2026">2022-2026</option>
                                <option value="2023-2027">2023-2027</option>
                                <option value="2024-2028">2024-2028</option>
                            </select>
                        </div>
                    </>
                )}

                <button type="submit" className="search-button">
                    Search
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}

            <div>
                {results.length > 0 ? (
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Register No</th>
                                <th>Student Name</th>
                                <th>CGPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result, index) => (
                                <tr key={index}>
                                    <td>{result['Roll No']}</td>
                                    <td>{result['Register Number']}</td>
                                    <td>{result['Student Name']}</td>
                                    <td>{result.CGPA}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );
}

export default CGPA;
