import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, BarChart, User, ChevronLeft, ChevronRight } from 'lucide-react';
import './../../styles/Pages/Dashboard.css';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <div className="dashboard-container">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <button className="toggle-button" onClick={toggleSidebar}>
                    {isSidebarOpen ? <ChevronLeft className="icon" /> : <ChevronRight className="icon" />}
                </button>
                <nav>
                    <ul>
                        <li>
                            <Link to="/dashboard/home" className="sidebar-link">
                                <Home className="icon" /> {isSidebarOpen && <span>Home</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/cgpa" className="sidebar-link">
                                <BarChart className="icon" /> {isSidebarOpen && <span>CGPA</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/profile" className="sidebar-link">
                                <User className="icon" /> {isSidebarOpen && <span>Profile</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Dashboard;
