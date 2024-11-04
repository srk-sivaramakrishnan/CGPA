import React, { useState } from 'react';
import axios from 'axios';
import baseURL from '../../auth/connection'; // Import the base URL
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [facultyId, setFacultyId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // For navigation after login

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${baseURL}/faculty/login`, {
                facultyId,
                password,
            });

            // Save token to local storage
            localStorage.setItem('token', response.data.token);

            // Redirect to the dashboard
            navigate('/dashboard');
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message); // Show error message from the server
            } else {
                setError('Server error. Please try again.'); // General error message
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Faculty Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="facultyId">Faculty ID</label>
                    <input
                        type="text"
                        id="facultyId"
                        value={facultyId}
                        onChange={(e) => setFacultyId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
