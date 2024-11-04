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

    const handleManageCGPAClick = () => {
        navigate('/dashboard/cgpa/manage'); // Navigate to Manage CGPA page
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/faculty/cgpa-calculation`, {
                params: { category: searchCategory, filterValue: searchValue },
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
                    </select>
                </div>

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
