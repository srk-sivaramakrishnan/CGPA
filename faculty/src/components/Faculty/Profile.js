import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../auth/connection';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const facultyId = localStorage.getItem('facultyId'); // Retrieve facultyId from localStorage

            if (!facultyId) {
                setError('Faculty ID not found. Please log in again.');
                return;
            }

            try {
                const response = await axios.get(`${baseURL}/faculty/profile`, {
                    params: { facultyId },
                });
                setProfile(response.data);
            } catch (err) {
                setError('Failed to fetch profile');
            }
        };

        fetchProfile();
    }, []);

    return (
        <div>
            <h2>Profile</h2>
            {error && <p className="error">{error}</p>}
            {profile ? (
                <div>
                    <p>Faculty ID: {profile['Faculty Id']}</p>
                    <p>Name: {profile.Name}</p>
                    <p>Email: {profile.Email}</p>
                    <p>Department: {profile.Department}</p>
                    <p>Class: {profile.Class}</p>
                    <p>Section: {profile.Section}</p>
                    <p>Class Advisor: {profile['Class Advisor']}</p>
                    <p>Batch: {profile.Batch}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Profile;
