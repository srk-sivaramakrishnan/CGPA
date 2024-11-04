-- Create the database
CREATE DATABASE cgpa_calci;

-- Use the database
USE cgpa_calci;

-- Create the Faculty table
CREATE TABLE Faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `Faculty Id` VARCHAR(10) NOT NULL,
    `Name` VARCHAR(50) NOT NULL,
    `Email` VARCHAR(50) NOT NULL,
    `Department` VARCHAR(50) NOT NULL,
    `Class` VARCHAR(100) NOT NULL,
    `Section` VARCHAR(10) NOT NULL,
    `Class Advisor` VARCHAR(100) NOT NULL,
    `Batch` VARCHAR(20) NOT NULL,
    `Password` VARCHAR(255) NOT NULL
);

-- Create the admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(10) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a record with bcrypt-hashed password into the admins table
INSERT INTO admins (admin_id, email, password)
VALUES ('admin', 'admin@gmail.com', '$2b$10$avgZaSdi5nF6.37eWWGFIOTuSgBWmwz6h3Y4k5wNol6n6Zf3IhF32');

CREATE TABLE Subjects (
    `Subject Code` VARCHAR(10) PRIMARY KEY,
    `Subject Name` VARCHAR(255) NOT NULL,
    `Credits` INT NOT NULL
);

CREATE TABLE Grades (
    `Roll No` VARCHAR(10) NOT NULL,
    `Register Number` VARCHAR(20) NOT NULL,
    `Student Name` VARCHAR(255) NOT NULL,
    `Subject Code` VARCHAR(10) NOT NULL,
    `Grade` VARCHAR(2) NOT NULL,
    `Semester` VARCHAR(20) NOT NULL,
    `Department` VARCHAR(50) NOT NULL,
    `Year` VARCHAR(10) NOT NULL,
    `Section` VARCHAR(10) NOT NULL,
    `Batch` VARCHAR(10) NOT NULL,
    PRIMARY KEY (`Roll No`, `Subject Code`, `Semester`, `Batch`, `Department`, `Year`, `Section`),
    FOREIGN KEY (`Subject Code`) REFERENCES Subjects(`Subject Code`)
);

ALTER TABLE Grades MODIFY COLUMN `Grade` VARCHAR(5);



CREATE TABLE cgpa_calculation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `Roll No` VARCHAR(20) NOT NULL,
    `Register Number` VARCHAR(20) NOT NULL,
    `Student Name` VARCHAR(100) NOT NULL,
    `Semester` VARCHAR(20) NOT NULL,
    `Total Score` DECIMAL(10, 2) NOT NULL,
    `Total Credits` INT NOT NULL
);

ALTER TABLE cgpa_calculation
MODIFY COLUMN `Semester` VARCHAR(255) NOT NULL DEFAULT 'default_value';



CREATE TABLE cgpa_results ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    `Roll No` VARCHAR(20) NOT NULL,
    `Register Number` VARCHAR(20) NOT NULL,
    `Student Name` VARCHAR(100) NOT NULL,
    `Department` VARCHAR(50) NOT NULL,
    `Year` VARCHAR(10) NOT NULL,
    `Section` VARCHAR(10) NOT NULL,
    `Batch` VARCHAR(10) NOT NULL,
    `CGPA` DECIMAL(3, 2) NOT NULL
);




