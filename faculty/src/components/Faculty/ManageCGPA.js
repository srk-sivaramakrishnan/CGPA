import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import baseURL from '../../auth/connection';
import '../../styles/Faculty/ManageCGPA.css';
import { Save } from 'lucide-react';

function ManageCGPA() {
    const [semester, setSemester] = useState('');
    const [department, setDepartment] = useState('');
    const [facultyClass, setFacultyClass] = useState('');
    const [section, setSection] = useState('');
    const [batch, setBatch] = useState('');
    const [file, setFile] = useState(null);
    const [gpaResults, setGpaResults] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalCredits, setTotalCredits] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const calculateGPA = (data) => {
        const gradePoints = {
            'O': 10,
            'A+': 9,
            'A': 8,
            'B+': 7,
            'B': 6,
            'C': 5,
            'U': 0,
        };

        const results = {};
        let totalCredits = 0;

        const creditsRow = data[2];
        const credits = creditsRow.slice(3);
        totalCredits = credits.reduce((acc, curr) => acc + Number(curr), 0);
        console.log("Total Credits Calculated: ", totalCredits);

        for (let i = 3; i < data.length; i++) {
            const [rollNo, registerNumber, studentName, ...grades] = data[i];
            let totalScore = 0;
            let semesterCredits = 0;

            grades.forEach((grade, index) => {
                const points = gradePoints[grade] || 0;
                const credit = Number(credits[index]) || 0;
                totalScore += points * credit;
                semesterCredits += credit;
            });

            if (rollNo && registerNumber && studentName) {
                const gpa = semesterCredits > 0 ? (totalScore / semesterCredits).toFixed(3) : 0;

                if (!results[rollNo]) {
                    results[rollNo] = { totalScore: 0, totalCredits: 0, rollNo, registerNumber, studentName };
                }

                results[rollNo].totalScore += parseFloat(totalScore);
                results[rollNo].totalCredits += parseFloat(semesterCredits);

                const cgpa = results[rollNo].totalCredits > 0
                    ? (results[rollNo].totalScore / results[rollNo].totalCredits).toFixed(2)
                    : 0;

                results[rollNo] = {
                    ...results[rollNo],
                    totalScore: results[rollNo].totalScore,
                    totalCredits: results[rollNo].totalCredits,
                    gpa,
                    cgpa,
                    department,
                    year: facultyClass,
                    section,
                    batch
                };
            }
        }
        setGpaResults(Object.values(results));
        setIsModalOpen(true);
        setTotalCredits(totalCredits);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!semester || !department || !facultyClass || !section || !batch || !file) {
            alert('Please fill in all fields and upload the file.');
            return;
        }
    
        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            
            // Calculate GPA
            calculateGPA(jsonData);
    
            // Chunking the data for upload
            const chunkedData = chunkArray(jsonData, 10); // Adjust the size as needed
            setLoading(true);
            
            try {
                for (let i = 0; i < chunkedData.length; i++) {
                    const chunk = chunkedData[i];
                    const chunkFormData = new FormData();
                    chunkFormData.append('file', file);
                    chunkFormData.append('semester', semester);
                    chunkFormData.append('department', department);
                    chunkFormData.append('year', facultyClass);
                    chunkFormData.append('section', section);
                    chunkFormData.append('batch', batch);
                    chunkFormData.append('data', JSON.stringify(chunk)); // Sending chunk data
    
                    await axios.post(`${baseURL}/faculty/upload-cgpa`, chunkFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        timeout: 120000,
                    });
                    console.log(`Chunk ${i + 1} uploaded successfully`);
                }
                alert('All chunks uploaded successfully');
            } catch (error) {
                console.error('Error uploading file:', error);
                if (error.response) {
                    alert(`Server Error: ${error.response.data.message || 'Failed to upload file.'}`);
                } else if (error.request) {
                    alert('Network Error: No response from the server. Please try again later.');
                } else {
                    alert(`Error: ${error.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };
    

    // Function to chunk array into smaller arrays of a given size
    const chunkArray = (array, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const handleSave = async () => {
        if (gpaResults.length === 0) {
            alert('No GPA results to save. Please calculate GPA before saving.');
            return;
        }
    
        const saveData = gpaResults.map(result => ({
            rollNo: result.rollNo,
            registerNumber: result.registerNumber,
            studentName: result.studentName,
            totalScore: result.totalScore,
            totalCredits: result.totalCredits,
            semester: semester,
            department: result.department,
            year: result.year,
            section: result.section,
            batch: result.batch,
            gpa: result.gpa,
            cgpa: result.cgpa,
        }));

        // Split the saveData into chunks of 10
        const chunkedData = chunkArray(saveData, 10);

        setLoading(true);
        try {
            for (let i = 0; i < chunkedData.length; i++) {
                const chunk = chunkedData[i];
                await axios.post(`${baseURL}/faculty/save-cgpa-results`, chunk, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    timeout: 120000, // Timeout set to 120 seconds
                });
                console.log(`Batch ${i + 1} saved successfully`);
            }
            alert('GPA results saved successfully!');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Failed to save some results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manage-cgpa-container">
            <h2>Manage CGPA</h2>
            {loading && <div className="loading">Saving results...</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="semester">Select Semester:</label>
                        <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} required>
                            <option value="">--Select Semester--</option>
                            <option value="1st Semester">1st Semester</option>
                            <option value="2nd Semester">2nd Semester</option>
                            <option value="3rd Semester">3rd Semester</option>
                            <option value="4th Semester">4th Semester</option>
                            <option value="5th Semester">5th Semester</option>
                            <option value="6th Semester">6th Semester</option>
                            <option value="7th Semester">7th Semester</option>
                            <option value="8th Semester">8th Semester</option>
                        </select>
                    </div>
    
                    <div className="form-group">
                        <label htmlFor="department">Department:</label>
                        <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                            <option value="">Select Department</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                        </select>
                    </div>
                </div>
    
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="facultyClass">Studying Year:</label>
                        <select id="facultyClass" value={facultyClass} onChange={(e) => setFacultyClass(e.target.value)} required>
                            <option value="">Select Year</option>
                            <option value="1st">1st</option>
                            <option value="2nd">2nd</option>
                            <option value="3rd">3rd</option>
                            <option value="4th">4th</option>
                        </select>
                    </div>
    
                    <div className="form-group">
                        <label htmlFor="section">Section:</label>
                        <select id="section" value={section} onChange={(e) => setSection(e.target.value)} required>
                            <option value="">Select Section</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                        </select>
                    </div>
    
                    <div className="form-group">
                        <label htmlFor="batch">Select Batch:</label>
                        <select id="batch" value={batch} onChange={(e) => setBatch(e.target.value)} required>
                            <option value="">Select Batch</option>
                            <option value="2021-2025">2021-2025</option>
                            <option value="2022-2026">2022-2026</option>
                            <option value="2023-2027">2023-2027</option>
                            <option value="2024-2028">2024-2028</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="file">Upload File:</label>
                    <input type="file" id="file" accept=".xlsx, .xls" onChange={handleFileChange} required />
                </div>
                <button type="submit" className="btn-calculate">Upload and Calculate GPA</button>
            </form>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>GPA and CGPA Results</h2>
                        <p>Total Credits: {totalCredits}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Register No</th>
                                    <th>Student Name</th>
                                    <th>Total Score</th>
                                    <th>GPA</th>
                                    <th>CGPA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gpaResults.map((result) => (
                                    <tr key={result.rollNo}>
                                        <td>{result.rollNo}</td>
                                        <td>{result.registerNumber}</td>
                                        <td>{result.studentName}</td>
                                        <td>{result.totalScore}</td>
                                        <td>{result.gpa}</td>
                                        <td>{result.cgpa}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn-save" onClick={handleSave}>
                            <Save className="btn-icon" /> Save GPA Results
                        </button>
                        <button className="btn-close" onClick={() => setIsModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageCGPA;
