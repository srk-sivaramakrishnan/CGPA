import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom'; // Import Link and Outlet for navigation
import { Home, BarChart, User, ChevronLeft, ChevronRight } from 'lucide-react'; // Import Lucide icons
import './../../styles/Pages/Dashboard.css'; // Import CSS styles

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to manage sidebar visibility

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev); // Toggle sidebar visibility
    };

    return (
        <div className="dashboard-container">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <button className="toggle-button" onClick={toggleSidebar}>
                    {isSidebarOpen ? <ChevronLeft className="icon" /> : <ChevronRight className="icon" />}
                </button>
                {isSidebarOpen && (
                    <>
                        <h2>Faculty Dashboard</h2>
                        <nav>
                            <ul>
                                <li>
                                    <Link to="/dashboard/home" className="sidebar-link">
                                        <Home className="icon" /> Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/cgpa" className="sidebar-link">
                                        <BarChart className="icon" /> CGPA
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/profile" className="sidebar-link">
                                        <User className="icon" /> Profile
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </>
                )}
            </aside>
            <main className="dashboard-content"> {/* Add a main content area */}
                <Outlet /> {/* This is where child routes will render */}
            </main>
        </div>
    );
};

export default Dashboard;
