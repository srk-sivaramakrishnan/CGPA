import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from 'react-modal';
import * as XLSX from 'xlsx';
import '../../styles/Faculty/CalculatingCGPA.css';
import baseURL from '../../auth/connection';
import axios from 'axios';

Modal.setAppElement('#root');

function CalculatingCGPA() {
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [facultyClass, setFacultyClass] = useState('');
  const [section, setSection] = useState('');
  const [batch, setBatch] = useState('');
  const [file, setFile] = useState(null);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [isPreviewSubjects, setIsPreviewSubjects] = useState(true);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      parseExcelFile(uploadedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const openSubjectsModal = () => setIsSubjectsModalOpen(true);
  const closeSubjectsModal = () => setIsSubjectsModalOpen(false);
  const openGradesModal = () => setIsGradesModalOpen(true);
  const closeGradesModal = () => setIsGradesModalOpen(false);

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      const filteredData = data.filter(row => row.some(cell => cell !== ""));

      if (filteredData.length > 2) { // Ensure there's enough data
        setExcelData(filteredData);
        console.log("Parsed Excel Data:", filteredData); // Log the parsed data
        openSubjectsModal();
      } else {
        alert("No valid data found in the uploaded file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleNext = async () => {
    setIsPreviewSubjects(false);

    const subjects = excelData[0].slice(3).map((subjectCode, index) => ({
      subjectCode,
      subjectName: excelData[1][index + 3],
      credits: excelData[2][index + 3],
    }));

    try {
      await axios.post(`${baseURL}/faculty/upload-subjects`, { subjects }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Subjects uploaded successfully');
      closeSubjectsModal();
      openGradesModal();
    } catch (error) {
      console.error('Error uploading subjects:', error);
      alert('Failed to upload subjects. Please try again.');
    }
  };

  const handlePrevious = () => {
    setIsPreviewSubjects(true);
  };

  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };
  

  const uploadGrades = async () => {
    const grades = excelData.slice(3).map((row) => {
      return {
        rollNo: row[0],
        registerNumber: row[1],
        studentName: row[2],
        subjectCodes: excelData[0].slice(3), // Array of subject codes
        grades: row.slice(3), // Array of grades
        semester,
        department,
        year: facultyClass,
        section,
        batch,
      };
    });
  
    // Chunk the grades array into chunks of 10
    const gradeChunks = chunkArray(grades, 10);
  
    try {
      for (const chunk of gradeChunks) {
        await axios.post(`${baseURL}/faculty/upload-grades`, { grades: chunk }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('Grades chunk uploaded successfully:', chunk);
      }
      console.log('All grades uploaded successfully');
      closeGradesModal();
    } catch (error) {
      console.error('Error uploading grades:', error);
      alert('Failed to upload grades. Please try again.');
    }
  };
  

  return (
    <div className="calculating-cgpa-container">
      <h2>Calculating CGPA</h2>

      <div className="form-group">
        <label htmlFor="semester">Semester:</label>
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

      <div {...getRootProps()} className="file-dropzone">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag & drop an Excel file here, or click to select one</p>
        )}
        {file && <p>Selected file: {file.name}</p>}
      </div>

      {/* First Modal for Subjects */}
      <Modal
        isOpen={isSubjectsModalOpen}
        onRequestClose={closeSubjectsModal}
        contentLabel="Subjects Preview"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <h2>Subjects Preview</h2>
          <button className="close-modal" onClick={closeSubjectsModal}>&times;</button>
          <div className="modal-table-container">
            {isPreviewSubjects && (
              <>
                <h3>Subjects</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData[0] && excelData[0].slice(3).map((subjectCode, index) => (
                      <tr key={index}>
                        <td>{subjectCode}</td>
                        <td>{excelData[1][index + 3]}</td>
                        <td>{excelData[2][index + 3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
          <div className="modal-navigation">
            <button className="previous-button" onClick={handlePrevious}>Previous</button>
            <button className="next-button" onClick={handleNext}>Next</button>
          </div>
        </div>
      </Modal>

      {/* Second Modal for Grades */}
      <Modal
        isOpen={isGradesModalOpen}
        onRequestClose={closeGradesModal}
        contentLabel="Grades Preview"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <h2>Grades Preview</h2>
          <button className="close-modal" onClick={closeGradesModal}>&times;</button>
          <div className="modal-table-container">
            <h3>Grades</h3>
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Register No</th>
                  <th>Student Name</th>
                  {excelData[0] && excelData[0].slice(3).map((subjectCode, index) => (
                    <th key={index}>{subjectCode}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.slice(3).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    {row.slice(3).map((grade, index) => (
                      <td key={index}>{grade}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-navigation">
            <button className="submit-button" onClick={uploadGrades}>Submit Grades</button>
            <button className="close-modal" onClick={closeGradesModal}>Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CalculatingCGPA;
