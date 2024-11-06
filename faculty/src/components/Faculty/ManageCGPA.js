import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from 'react-modal';
import * as XLSX from 'xlsx';
import '../../styles/Faculty/ManageCGPA.css';
import baseURL from '../../auth/connection';
import axios from 'axios';

Modal.setAppElement('#root');

function ManageCGPA() {
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [facultyClass, setFacultyClass] = useState('');
  const [section, setSection] = useState('');
  const [batch, setBatch] = useState('');
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [isStoreGpaModalOpen, setIsStoreGpaModalOpen] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [gpaResults, setGpaResults] = useState([]);
  const [isPreviewSubjects, setIsPreviewSubjects] = useState(true);
  const [loading, setLoading] = useState(false); // For general loading


  // Grade points mapping
  const gradePoints = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'U': 0,
  };

  const onDrop = (acceptedFiles) => {
    if (!semester || !department || !facultyClass || !section || !batch) {
      alert("Please fill in all dropdowns before uploading the file.");
      return;
    }

    if (acceptedFiles.length > 0) {
      parseExcelFile(acceptedFiles[0]);
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
  const openStoreGpaModal = () => setIsStoreGpaModalOpen(true);
  const closeStoreGpaModal = () => setIsStoreGpaModalOpen(false);

  const parseExcelFile = (file) => {
    setLoading(true); // Start loading
    
    // Simulate the delay (3 seconds) for parsing the file
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
    
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        const filteredData = data.filter(row => row.some(cell => cell !== ""));
    
        setLoading(false); // End loading after parsing
    
        if (filteredData.length > 2) {
          setExcelData(filteredData);
          openSubjectsModal(); // Open Subjects modal first
        } else {
          alert("No valid data found in the uploaded file.");
        }
      };
      reader.readAsBinaryString(file);
    }, 3000); // 3-second delay
  };
  
  const handleNext = async () => {
    setIsPreviewSubjects(false);
    setLoading(true); // Set loading state to true
  
    const subjects = excelData[0].slice(3).map((subjectCode, index) => ({
      subjectCode,
      subjectName: excelData[1][index + 3],
      credits: excelData[2][index + 3],
    }));
  
    // Set a delay before performing the upload action
    setTimeout(async () => {
      try {
        await axios.post(`${baseURL}/faculty/upload-subjects`, { subjects }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        closeSubjectsModal();
        openGradesModal(); // Open Grades modal after uploading subjects
      } catch (error) {
        console.error('Error uploading subjects:', error);
        alert('Failed to upload subjects. Please try again.');
      } finally {
        setLoading(false); // Reset loading state after operation
      }
    }, 3000); // Delay for 3 seconds (3000 ms)
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
    setLoading(true); // Start loading
  
    // Simulate loading delay of 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
  
    const grades = excelData.slice(3).map((row) => {
      return {
        rollNo: row[0],
        registerNumber: row[1],
        studentName: row[2],
        subjectCodes: excelData[0].slice(3),
        grades: row.slice(3),
        semester,
        department,
        year: facultyClass,
        section,
        batch,
      };
    });
  
    const creditsRow = excelData[2];
    const credits = creditsRow.slice(3);
  
    const calculatedTotalCredits = credits.reduce((acc, curr) => acc + Number(curr), 0);
  
    const gradeChunks = chunkArray(grades, 10);
  
    try {
      for (const chunk of gradeChunks) {
        await axios.post(`${baseURL}/faculty/upload-grades`, { grades: chunk }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }
  
      const calculatedGpaResults = gradeChunks.flatMap((chunk) =>
        chunk.map((grade) => {
          let totalScore = 0;
  
          grade.subjectCodes.forEach((subjectCode, index) => {
            const subjectCredit = parseFloat(credits[index]);
            const gradePoint = gradePoints[grade.grades[index]] || 0;
            totalScore += gradePoint * subjectCredit;
          });
  
          const gpa = calculatedTotalCredits > 0 ? totalScore / calculatedTotalCredits : 0;
  
          return {
            rollNo: grade.rollNo,
            registerNumber: grade.registerNumber,
            studentName: grade.studentName,
            totalScore,
            gpa: gpa.toFixed(2),
            totalCredits: calculatedTotalCredits
          };
        })
      );
  
      setGpaResults(calculatedGpaResults);
      closeGradesModal();
      openStoreGpaModal(); // Open Store GPA modal after uploading grades
    } catch (error) {
      console.error('Error uploading grades:', error);
      alert('Failed to upload grades. Please try again.');
    } finally {
      setLoading(false); // End loading after uploading grades
    }
  };
  
  const storeGpaResults = async () => {
    // No loading state, remove setLoading logic
  
    // Simulate loading delay of 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
  
    const gpaData = gpaResults.map(result => ({
      rollNo: result.rollNo,
      registerNumber: result.registerNumber,
      studentName: result.studentName,
      semester,
      totalScore: result.totalScore,
      totalCredits: result.totalCredits,
    }));
  
    const chunkedData = chunkArray(gpaData, 10); // Split data into chunks of 10
  
    try {
      for (const chunk of chunkedData) {
        await axios.post(`${baseURL}/faculty/store-cgpa-calculation`, { gpaData: chunk }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('Batch stored successfully!');
      }
      alert('GPA results stored successfully!');
      closeStoreGpaModal();
    } catch (error) {
      console.error('Error storing GPA results:', error);
      alert('Failed to store GPA results. Please try again.');
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
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="facultyClass">Class:</label>
          <select id="facultyClass" value={facultyClass} onChange={(e) => setFacultyClass(e.target.value)} required>
            <option value="">Select Class</option>
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

        <div className="form-group" {...getRootProps()} style={{ border: isDragActive ? '2px dashed #ccc' : '2px dashed #bbb' }}>
  <input {...getInputProps()} />
  <p>{isDragActive ? 'Drop the file here...' : 'Drag & drop an Excel file or click to select one'}</p>
  {loading && (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  )}
</div>

   {/* Subjects Modal */}
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
    {loading ? (
  <div className="loading-indicator"></div> // Show the round loading indicator
) : (
  isPreviewSubjects ? (
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
  ) : (
    <div>
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
              {row.slice(3).map((grade, colIndex) => (
                <td key={colIndex}>{grade}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
)}
    </div>
    <div className="modal-navigation">
      {isPreviewSubjects && (
        <button className="next-button" onClick={handleNext}>Next</button>
      )}
      {!isPreviewSubjects && (
        <button className="previous-button" onClick={handlePrevious}>Previous</button>
      )}
    </div>
  </div>
</Modal>

{/* Grades Modal */}
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
      {loading ? (
        <div className="loading-indicator"></div> // Show loading indicator
      ) : (
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
                {row.slice(3).map((grade, colIndex) => (
                  <td key={colIndex}>{grade}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    <div className="modal-navigation">
      <button className="previous-button" onClick={handlePrevious}>Previous</button>
      <button className="next-button" onClick={uploadGrades}>Next</button>
    </div>
  </div>
</Modal>

{/* Store GPA Modal */}
<Modal
  isOpen={isStoreGpaModalOpen}
  onRequestClose={() => setIsStoreGpaModalOpen(false)}
  contentLabel="Store GPA Results"
  className="modal"
  overlayClassName="modal-overlay"
>
  <div className="modal-content">
    <h2>Store GPA Results</h2>
    <button className="close-modal" onClick={() => setIsStoreGpaModalOpen(false)}>&times;</button>
    <div className="modal-table-container">
      <p>Semester: {semester}</p>
      <p>Total Credits: {gpaResults[0]?.totalCredits}</p>
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
    </div>
    <div className="modal-navigation">
      <button className="store-button" onClick={storeGpaResults}>Store Results</button>
    </div>
  </div>
</Modal>
    </div>
  );
}

export default ManageCGPA;