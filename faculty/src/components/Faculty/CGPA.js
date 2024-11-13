import React, { useState, useCallback } from 'react';
import '../../styles/Faculty/CGPA.css';
import axios from 'axios';
import baseURL from '../../auth/connection';
import { useNavigate } from 'react-router-dom';
import { X, Loader } from 'lucide-react'; // Importing Loader icon from lucide-react
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Import the autoTable plugin

const CGPA = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Initially set to false
    const [error, setError] = useState(null);

    // States for handling dropdown and input
    const [searchCategory, setSearchCategory] = useState('rollNo');
    const [searchValue, setSearchValue] = useState('');
    const [department, setDepartment] = useState('');
    const [section, setSection] = useState('');
    const [batch, setBatch] = useState('');
    const [fileFormat, setFileFormat] = useState('xlsx'); // State for file format selection

    // States for popup modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [students, setStudents] = useState([]);

    const fileName = 'Classwise_CGPA_Results'; // For the exported file name

    // Fetch CGPA data for a specific student or class
    const fetchCGPAData = useCallback(async () => {
        try {
            setLoading(true); // Start loading
            const searchQuery = searchValue.trim();

            if ((searchCategory === 'rollNo' || searchCategory === 'registerNo') && searchQuery !== '') {
                const queryValue = searchCategory === 'registerNo'
                    ? Number(searchQuery)
                    : searchQuery.toUpperCase();

                const response = await axios.get(`${baseURL}/faculty/cgpa-calculation`, {
                    params: {
                        category: searchCategory,
                        filterValue: queryValue,
                    }
                });

                if (response.data && response.data.length > 0) {
                    setStudents(response.data);
                    setIsModalOpen(true);
                } else {
                    setError(`No student found with this ${searchCategory === 'rollNo' ? 'Roll No' : 'Register Number'}.`);
                }
            } else if (searchCategory === 'classwise' && department && section && batch) {
                const response = await axios.get(`${baseURL}/faculty/cgpa-calculation`, {
                    params: {
                        category: 'classwise',
                        department,
                        section,
                        batch,
                    }
                });

                if (response.data && response.data.length > 0) {
                    setStudents(response.data);
                    setIsModalOpen(true);
                } else {
                    setError('No students found for the selected class.');
                }
            } else {
                setError('Please enter valid Roll No, Register No, or classwise search parameters.');
            }
        } catch (err) {
            setError('Failed to fetch CGPA data. Please try again later.');
        } finally {
            setLoading(false); // Stop loading
        }
    }, [searchCategory, searchValue, department, section, batch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Start loading when the search is submitted
        fetchCGPAData();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setStudents([]);
    };

    // Function to download data as XLSX
    const downloadXLSX = () => {
        const headers = ['Roll No', 'Register No', 'Student Name', 'CGPA'];
        const rows = students.map(student => [
            student.rollNo,
            student.registerNumber,
            student.studentName,
            student.cgpa,
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CGPA Results');

        const additionalInfo = [
            ['Department:', department],
            ['Section:', section],
            ['Batch:', batch],
        ];

        const infoSheet = XLSX.utils.aoa_to_sheet(additionalInfo);
        XLSX.utils.book_append_sheet(wb, infoSheet, 'Additional Info');

        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    // Function to download data as PDF
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(12);

        const pageWidth = doc.internal.pageSize.width;
        const heading = 'Classwise CGPA Results';
        const headingWidth = doc.getTextWidth(heading);
        const headingX = (pageWidth - headingWidth) / 2;

        doc.text(heading, headingX, 10);

        doc.text(`Department: ${department}`, 14, 20);
        doc.text(`Section: ${section}`, 14, 30);
        doc.text(`Batch: ${batch}`, 14, 40);

        const tableColumn = ['Roll No', 'Register No', 'Student Name', 'CGPA'];
        const tableRows = students.map(student => [
            student.rollNo,
            student.registerNumber,
            student.studentName,
            student.cgpa,
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        doc.save(`${fileName}.pdf`);
    };

    const handleDownload = () => {
        if (students.length > 0) {
            if (fileFormat === 'xlsx') {
                downloadXLSX();
            } else if (fileFormat === 'pdf') {
                downloadPDF();
            }
        }
    };

    return (
        <div className="cgpa-container">
            <div className="cgpa-header">
                <h2>CGPA</h2>
                <button className="cgpa-control-button" onClick={() => navigate('/dashboard/cgpa/manage')}>
                    Manage CGPA
                </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="form-group">
                    <label htmlFor="search-category">Select Category:</label>
                    <select
                        id="search-category"
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                    >
                        <option value="rollNo">Roll No</option>
                        <option value="registerNo">Register No</option>
                        <option value="classwise">Classwise</option>
                    </select>
                </div>

                {(searchCategory === 'rollNo' || searchCategory === 'registerNo') && (
                    <div className="form-group">
                        <label htmlFor="search-value">
                            Enter {searchCategory === 'rollNo' ? 'Roll No' : 'Register No'}:
                        </label>
                        <input
                            type="text"
                            id="search-value"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            required
                        />
                    </div>
                )}

                {searchCategory === 'classwise' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="department">Department:</label>
                            <select
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                            >
                                <option value="">Select Department</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="ME">ME</option>
                                <option value="CE">CE</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="section">Section:</label>
                            <select
                                id="section"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                required
                            >
                                <option value="">Select Section</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="batch">Batch:</label>
                            <select
                                id="batch"
                                value={batch}
                                onChange={(e) => setBatch(e.target.value)}
                                required
                            >
                                <option value="">Select Batch</option>
                                <option value="2021-2025">2021-2025</option>
                                <option value="2022-2026">2022-2026</option>
                                <option value="2023-2027">2023-2027</option>
                                <option value="2024-2028">2024-2028</option>
                            </select>
                        </div>
                    </>
                )}

                <button type="submit" className="search-button">
                    {loading ? (
                        <Loader className="loading-spinner" /> 
                    ) : (
                        'Search'
                    )}
                </button>
            </form>

            {error && <div className="error">{error}</div>}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <button className="close-button" onClick={handleCloseModal}>
                            <X />
                        </button>
                        <div className="modal-content">
                            <h3>CGPA Results</h3>

                            {searchCategory === 'classwise' && (
                                <>
                                    <label htmlFor="file-format">Select File Format:</label>
                                    <select
                                        id="file-format"
                                        value={fileFormat}
                                        onChange={(e) => setFileFormat(e.target.value)}
                                    >
                                        <option value="xlsx">Excel</option>
                                        <option value="pdf">PDF</option>
                                    </select>

                                    <button onClick={handleDownload} className="download-button">
                                        Download
                                    </button>
                                </>
                            )}

                            <table>
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Register No</th>
                                        <th>Student Name</th>
                                        <th>CGPA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.registerNumber}>
                                            <td>{student.rollNo}</td>
                                            <td>{student.registerNumber}</td>
                                            <td>{student.studentName}</td>
                                            <td>{student.cgpa}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CGPA;
