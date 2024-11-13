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
  const [section, setSection] = useState('');
  const [batch, setBatch] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [isStoreGpaModalOpen, setIsStoreGpaModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [gpaResults, setGpaResults] = useState([]);
  const [isPreviewSubjects, setIsPreviewSubjects] = useState(true);
  const [loading, setLoading] = useState(false);
  const [setCgpaResults] = useState([]);

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
    if (!semester || !department || !section || !batch) {
      alert("Please fill in all dropdowns before uploading the file.");
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);  // Set the file name here
      parseExcelFile(file);    // Call the function to parse the file
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

  const closeSubjectsModal = () => setIsSubjectsModalOpen(false);
  const openSubjectsModal = () => setIsSubjectsModalOpen(true);
  const openGradesModal = () => setIsGradesModalOpen(true);
  const closeGradesModal = () => setIsGradesModalOpen(false);
  const openStoreGpaModal = () => setIsStoreGpaModalOpen(true);
  const closeStoreGpaModal = () => setIsStoreGpaModalOpen(false);
  const openConfirmationModal = () => setIsConfirmationModalOpen(true); // Open confirmation modal
  const closeConfirmationModal = () => setIsConfirmationModalOpen(false); // Close confirmation modal

  const parseExcelFile = (file) => {
    setLoading(true);

    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        const filteredData = data.filter((row, index) => index !== 3 && row.some(cell => cell !== ""));

        setLoading(false);

        if (filteredData.length > 2) {
          setExcelData(filteredData);
          openConfirmationModal();
        } else {
          alert("No valid data found in the uploaded file.");
        }
      };
      reader.readAsBinaryString(file);
    }, 3000);
  };

  const handleNext = async () => {
    setIsPreviewSubjects(true); // Set flag to preview subjects
    setLoading(true);

    // Map the subjects from the Excel data to send in the request
    const subjects = excelData[0].slice(3).map((subjectCode, index) => ({
        subjectCode,
        subjectName: excelData[1][index + 3],
        credits: excelData[2][index + 3],
    }));

    setTimeout(async () => {
        try {
            // Send request without token in headers
            await axios.post(`${baseURL}/faculty/upload-subjects`, { subjects });

            closeSubjectsModal();  // Close the subjects modal
            openGradesModal();  // Open next modal if needed
        } catch (error) {
            console.error('Error uploading subjects:', error);
            alert('Failed to upload subjects. Please try again.');
        } finally {
            setLoading(false);
        }
    }, 3000);
  };

  const handleModalTrigger = () => {
    openSubjectsModal();  // Trigger the modal to open
  };

  const handlePrevious = () => {
    setIsPreviewSubjects(false);
  };

  const uploadGrades = async () => {
    setLoading(true);

    // Delay for user experience
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Prepare grades data from Excel
    const grades = excelData.slice(3).map((row) => ({
        rollNo: row[0],
        registerNumber: row[1],
        studentName: row[2],
        subjectCodes: excelData[0].slice(3),
        grades: row.slice(3),
        semester,
        department,
        section,
        batch,
    }));

    const creditsRow = excelData[2];
    const credits = creditsRow.slice(3);

    try {
        // Send all grades at once without chunking
        await axios.post(`${baseURL}/faculty/upload-grades`, { grades });

        // Calculate GPA for each student
        const calculatedGpaResults = grades.map((grade) => {
            let totalScore = 0;
            let totalCredits = 0;

            grade.subjectCodes.forEach((subjectCode, index) => {
                const subjectCredit = parseFloat(credits[index]);
                const gradePoint = gradePoints[grade.grades[index]] || 0;

                if (grade.grades[index] !== 'U') {
                    totalScore += gradePoint * subjectCredit;
                    totalCredits += subjectCredit;
                }
            });

            const gpa = totalCredits > 0 ? totalScore / totalCredits : 0;

            return {
                rollNo: grade.rollNo,
                registerNumber: grade.registerNumber,
                studentName: grade.studentName,
                totalScore,
                gpa: gpa.toFixed(2),
                totalCredits,
            };
        });

        // Set calculated GPA results and open the next modal
        setGpaResults(calculatedGpaResults);
        closeGradesModal();
        openStoreGpaModal();
    } catch (error) {
        console.error('Error uploading grades:', error);
        alert('Failed to upload grades. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const storeGpaResults = async () => {
    // Simulate a delay for user experience
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Prepare the GPA data for storing
    const gpaData = gpaResults.map(result => ({
      rollNo: result.rollNo,
      registerNumber: result.registerNumber,
      studentName: result.studentName,
      semester,
      totalScore: result.totalScore,
      totalCredits: result.totalCredits,
      department,
      section,
      batch,
    }));

    try {
      // Send all GPA data at once without chunking
      await axios.post(`${baseURL}/faculty/store-cgpa-calculation`, { gpaData });
      console.log('Batch stored successfully!');

      // Show success alert and close modals
      alert('GPA results stored successfully!');
      closeStoreGpaModal();
      closeConfirmationModal(); // Close the confirmation modal after the alert

      // After successfully storing the GPA results, fetch the CGPA results
      fetchCgpaResults(); // Fetch CGPA results after storing GPA data
    } catch (error) {
      console.error('Error storing GPA results:', error);
      alert('Failed to store GPA results. Please try again.');
    }
  };

  const fetchCgpaResults = async () => {
    try {
      // Make the API call to fetch CGPA results
      const response = await axios.get(`${baseURL}/faculty/cgpa-calculation`, {
        params: { 
          department,
          section,
          batch,
          semester 
        }
      });

      // Check if the response contains data
      if (response.data) {
        // Store the fetched CGPA results in state
        console.log('Fetched CGPA results:', response.data);
        setCgpaResults(response.data);  // Update state to store CGPA results
      } else {
        alert('No CGPA data found for the selected filters.');
      }
    } catch (error) {
      console.error('Error fetching CGPA results:', error);
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

{/* Download Template Link */}
<div className="download-template-link">
  <a href="/Cgpa-Template.xlsx" download="Cgpa-Template.xlsx">Click here to download Template</a>
</div>



      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmationModalOpen}
        onRequestClose={() => setIsConfirmationModalOpen(false)}
        className="confirmation-modal"
        overlayClassName="confirmation-modal-overlay"
      >
        <h2>Confirm Your Selection</h2>
        <p>Semester: {semester}</p>
        <p>Department: {department}</p>
        <p>Section: {section}</p>
        <p>Batch: {batch}</p>
        <p>Uploaded File: {fileName}</p> {/* Display the uploaded file name */}
        <div className="confirmation-modal-actions">
          <button onClick={() => setIsConfirmationModalOpen(false)}>Cancel</button>
          <button onClick={handleModalTrigger}>Proceed</button>
        </div>
      </Modal>

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