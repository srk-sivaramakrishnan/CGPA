// AdminLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import baseURL from '../../auth/connection'; // Import the base URL
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        try {
            const response = await axios.post(`${baseURL}/admin/login`, {
                admin_id: adminId,
                password: password,
            });

            // Handle successful login
            setSuccess(response.data.message);
            setError('');
            console.log(response.data.admin); // Admin data can be used here

            // Redirect to the dashboard after a successful login
            navigate('/dashboard'); // Navigate to the dashboard

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
        <div className="admin-login">
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="adminId">Admin ID:</label>
                    <input
                        type="text"
                        id="adminId"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </form>
        </div>
    );
};

export default Login;
