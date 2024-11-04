// Dashboard.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // Import Link and Outlet from react-router-dom
import { HomeIcon, UsersIcon } from 'lucide-react'; // Import Lucide icons for home and faculty
import './../../styles/pages/dashboard.css'; // Import your CSS styles

const Dashboard = () => {
    return (
        <div className="dashboard">
            <aside className="sidebar">
                <h2>Dashboard</h2>
                <nav>
                    <ul>
                        <li>
                            <Link to="admin/home"> {/* Update path to "admin/home" */}
                                <HomeIcon className="icon" /> Admin Home
                            </Link>
                        </li>
                        <li>
                            <Link to="faculty"> {/* Link to "faculty" */}
                                <UsersIcon className="icon" /> Faculty
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="content">
                <Outlet /> {/* Renders the matched child route */}
            </main>
        </div>
    );
};

export default Dashboard;
