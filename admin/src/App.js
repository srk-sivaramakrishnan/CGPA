import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/pages/Login';
import Home from './components/pages/Home';
import Dashboard from './components/pages/dashboard';
import AdminHome from './components/Admin/AdminHome';
import Faculty from './components/Admin/Faculty';
import AddFaculty from './components/Admin/AddFaculty'; // Import AddFaculty

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route path="admin/home" element={<AdminHome />} />
                        <Route path="faculty" element={<Faculty />} />
                        <Route path="add-faculty" element={<AddFaculty />} /> {/* Add this route */}
                    </Route>
                </Routes>
            </div>
        </Router>
    );
};

export default App;
