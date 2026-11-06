CREATE DATABASE IF NOT EXISTS waste_booking;

USE waste_booking;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone CHAR(10) NOT NULL,
    address VARCHAR(255),
    role ENUM('user', 'collector', 'admin') NOT NULL DEFAULT 'user',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    pincode CHAR(6) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE waste_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    price DECIMAL(8, 2) NOT NULL CHECK (price >= 0),
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    waste_type_id INT NOT NULL,
    area_id INT NOT NULL,
    collector_id INT NULL,
    pickup_date DATE NOT NULL,
    time_slot ENUM(
        '9-11 AM',
        '11-1 PM',
        '2-4 PM',
        '4-6 PM'
    ) NOT NULL,
    address VARCHAR(255) NOT NULL,
    notes VARCHAR(200),
    status ENUM(
        'Pending',
        'Assigned',
        'Completed',
        'Cancelled'
    ) NOT NULL DEFAULT 'Pending',
    completed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (waste_type_id) REFERENCES waste_types (id) ON DELETE RESTRICT,
    FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT,
    FOREIGN KEY (collector_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);