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
            } else {
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
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            calculateGPA(jsonData);
        };
        reader.readAsArrayBuffer(file);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('semester', semester);
        formData.append('department', department);
        formData.append('year', facultyClass);
        formData.append('section', section);
        formData.append('batch', batch);

        try {
            await axios.post(`${baseURL}/faculty/upload-cgpa`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            alert('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        }
    };

    const handleSave = async () => {
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
    
        try {
            await axios.post(`${baseURL}/faculty/save-cgpa-results`, saveData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            alert('GPA results saved successfully!');
            setIsModalOpen(false); // Close the popup after saving
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Error saving results. Please try again.');
        }
    };
    

    return (
        <div className="manage-cgpa-container">
            <h2>Manage CGPA</h2>
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
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
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
                </div>
    
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="batch">Batch:</label>
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
                    <input type="file" id="file" onChange={handleFileChange} required />
                </div>
    
                <button type="submit" className="upload-button">
                    <Save size={16} />
                    Upload CGPA
                </button>
            </form>
    
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">

                        <h3>GPA Results</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Register No</th>
                                    <th>Student Name</th>
                                    <th>Total Score</th>
                                    <th>GPA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gpaResults.map((result, index) => (
                                    <tr key={index}>
                                        <td>{result.rollNo}</td>
                                        <td>{result.registerNumber}</td>
                                        <td>{result.studentName}</td>
                                        <td>{result.totalScore}</td>
                                        <td>{result.gpa}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h4>Total Credits: {totalCredits}</h4>
                        <button onClick={handleSave} className="save-button">
                            Save Results
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
    
}

export default ManageCGPA;
