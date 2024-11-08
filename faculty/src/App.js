import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Pages/Login'; 
import Dashboard from './components/Pages/Dashboard'; 
import Home from './components/Faculty/Home'; // Import Home component
import CGPA from './components/Faculty/CGPA'; // Import CGPA component
import Profile from './components/Faculty/Profile'; // Import Profile component
import ManageCGPA from './components/Faculty/ManageCGPA';
import CalculatingCGPA from './components/Faculty/CalculatingCGPA';
import FetchAllCGPA from './components/Faculty/FetchAllCGPA';

const App = () => {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Login />} /> 
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route path="home" element={<Home />} /> {/* Home route */}
                        <Route path="cgpa" element={<CGPA />} /> {/* CGPA route */}
                        <Route path="profile" element={<Profile />} /> {/* Profile route */}
                        <Route path="cgpa/manage" element={<ManageCGPA />} />
                        <Route path="cgpa/fetch" element={<FetchAllCGPA />} />
                        <Route path="cgpa/calculating" element={<CalculatingCGPA />} /> {/* Manage CGPA route */}
                    </Route>
                </Routes>
            </div>
        </Router>
    );
};

export default App;
