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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      const filteredData = data.filter(row => row.some(cell => cell !== ""));

      if (filteredData.length > 1) {
        setExcelData(filteredData);
        openModal();
      } else {
        alert("No valid data found in the uploaded file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleNext = async () => {
    setIsPreviewSubjects(false);
  
    // Extract subject data from the previewed modal rows
    const subjects = excelData[0].slice(3).map((subjectCode, index) => ({
      subjectCode,
      subjectName: excelData[1][index + 3],
      credits: excelData[2][index + 3],
    }));
  
    try {
      // Insert only the displayed subjects
      await axios.post(`${baseURL}/faculty/upload-subjects`, { subjects }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Subjects uploaded successfully');
    } catch (error) {
      console.error('Error uploading subjects:', error);
      alert('Failed to upload subjects. Please try again.');
    }
  };
  

  const handlePrevious = () => {
    setIsPreviewSubjects(true);
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Excel Data Preview"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <h2>Excel Data Preview</h2>
          <button className="close-modal" onClick={closeModal}>&times;</button>
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
    </div>
  );
}

export default CalculatingCGPA;
