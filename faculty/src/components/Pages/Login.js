import React, { useState } from 'react';
import axios from 'axios';
import baseURL from '../../auth/connection';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [facultyId, setFacultyId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${baseURL}/faculty/login`, {
                facultyId,
                password,
            });

            // Store facultyId in localStorage
            localStorage.setItem('facultyId', response.data.facultyId);

            // Redirect to the dashboard
            navigate('/dashboard');
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message);
            } else {
                setError('Server error. Please try again.');
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
