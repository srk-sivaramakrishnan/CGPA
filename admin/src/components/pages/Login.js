import React, { useState } from 'react';
import axios from 'axios';
import baseURL from '../../auth/connection'; // Assuming this is your base URL
import { useNavigate } from 'react-router-dom'; 

const Login = () => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate(); 

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form from refreshing
    
        if (!adminId || !password) {
            setError('Admin ID and Password are required');
            return;
        }
    
        try {
            const response = await axios.post(`${baseURL}/admin/login`, {
                admin_id: adminId,
                password: password,
            });
    
            setSuccess(response.data.message);
            setError('');
            navigate('/dashboard'); // Redirect on success
    
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred. Please try again.');
            }
            setSuccess('');
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
