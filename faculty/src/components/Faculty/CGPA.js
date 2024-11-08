import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseURL from '../../auth/connection';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // To handle tables in PDF format
import '../../styles/Faculty/CGPA.css';

function CGPA() {
    const navigate = useNavigate();

    // State variables for search
    const [searchCategory, setSearchCategory] = useState('rollNo');
    const [searchValue, setSearchValue] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState([]);

    // State variables for classwise search
    const [department, setDepartment] = useState('');
    const [section, setSection] = useState('');
    const [batch, setBatch] = useState('');
    const [downloadFormat, setDownloadFormat] = useState('xlsx'); // For selecting download format
    const [fileName, setFileName] = useState('cgpa_results'); // State to handle file name input

    const handleManageCGPAClick = () => {
        navigate('/dashboard/cgpa/manage');
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            let params = { category: searchCategory, filterValue: searchValue };
    
            // If the search category is 'classwise', include department, section, and batch
            if (searchCategory === 'classwise') {
                params = { ...params, department, section, batch };
            }
    
            // Perform GET request without Authorization header
            const response = await axios.get(`${baseURL}/faculty/cgpa-calculation`, {
                params: params,
                // No Authorization header here
            });
    
            setModalData(response.data);  // Set results to modalData
            setError('');  // Clear error message
            setIsModalOpen(true);  // Open the modal with results
        } catch (error) {
            console.error('Error fetching CGPA results:', error);
            setError('Failed to fetch CGPA results.');
        }
    };
    

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Function to download the results as XLSX
    const downloadXLSX = () => {
        const headers = ['Roll No', 'Register No', 'Student Name', 'CGPA'];
        const rows = modalData.map(result => [
            result['Roll No'],
            result['Register Number'],
            result['Student Name'],
            result.CGPA,
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CGPA Results');

        // Add additional info in a separate sheet
        const additionalInfo = [
            ['Department:', department],
            ['Section:', section],
            ['Batch:', batch],
        ];

        const infoSheet = XLSX.utils.aoa_to_sheet(additionalInfo);
        XLSX.utils.book_append_sheet(wb, infoSheet, 'Additional Info');

        // Download the file with the user-defined name
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    // Function to download the results as PDF
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(12);

        // Get the page width and center the heading
        const pageWidth = doc.internal.pageSize.width;
        const heading = 'CGPA Results';
        const headingWidth = doc.getTextWidth(heading);
        const headingX = (pageWidth - headingWidth) / 2; // Calculate X to center

        // Add centered heading
        doc.text(heading, headingX, 10);

        // Add additional info
        doc.text(`Department: ${department}`, 14, 20);
        doc.text(`Section: ${section}`, 14, 30);
        doc.text(`Batch: ${batch}`, 14, 40);

        const tableColumn = ['Roll No', 'Register No', 'Student Name', 'CGPA'];
        const tableRows = modalData.map(result => [
            result['Roll No'],
            result['Register Number'],
            result['Student Name'],
            result.CGPA,
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        // Save the PDF with the user-defined name
        doc.save(`${fileName}.pdf`);
    };

    // Function to handle download based on selected format
    const handleDownload = () => {
        if (downloadFormat === 'xlsx') {
            downloadXLSX();
        } else if (downloadFormat === 'pdf') {
            downloadPDF();
        }
    };

    return (
        <div className="cgpa-container">
            <div className="cgpa-header">
                <h2>CGPA</h2>
                <button className="cgpa-control-button" onClick={handleManageCGPAClick}>
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

                {searchCategory !== 'classwise' && (
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
                    Search
                </button>
            </form>

            {/* Modal for displaying fetched data */}
            {isModalOpen && (
                <div className="cgpa-modal-overlay">
                    <div className="cgpa-modal-content">
                        <button className="cgpa-close-modal" onClick={closeModal}>
                            &times;
                        </button>
                        <h3>CGPA Results</h3>

                        {/* Show download options only if the search is classwise */}
                        {searchCategory === 'classwise' && (
                            <div className="download-options">
                                <label htmlFor="file-name">Enter File Name:</label>
                                <input
                                    type="text"
                                    id="file-name"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                />

                                <label htmlFor="download-format">Select Format:</label>
                                <select
                                    id="download-format"
                                    value={downloadFormat}
                                    onChange={(e) => setDownloadFormat(e.target.value)}
                                >
                                    <option value="xlsx">Excel Sheet</option>
                                    <option value="pdf">PDF</option>
                                </select>

                                <button className="download-button" onClick={handleDownload}>
                                    Download Results
                                </button>
                            </div>
                        )}

                        {/* Display the error message if any */}
                        {error && <p className="error-message">{error}</p>}

                        {/* Display the results in a table inside the modal */}
                        {modalData.length > 0 ? (
                            <div>
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Roll No</th>
                                            <th>Register No</th>
                                            <th>Student Name</th>
                                            <th>CGPA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modalData.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data['Roll No']}</td>
                                                <td>{data['Register Number']}</td>
                                                <td>{data['Student Name']}</td>
                                                <td>{data.CGPA}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No results found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CGPA;
