// Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login'); // Navigate to the login page
    };

    return (
        <div>
            <h1>Welcome to the CGPA Calculator</h1>
            <p>This is the home page. You can navigate to the login page from here.</p>
            <button onClick={handleLoginClick}>Login</button>
        </div>
    );
};

export default Home;
