CREATE DATABASE IF NOT EXISTS
waste_collection;

USE waste_collection;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'collector')
        NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS waste_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    completed_at DATETIME NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (waste_type_id)
        REFERENCES waste_types(id),

    FOREIGN KEY (area_id)
        REFERENCES areas(id),

    FOREIGN KEY (collector_id)
        REFERENCES users(id)
);

USE waste_collection;

INSERT IGNORE INTO areas (name, description)
VALUES
('Juhu', 'Juhu residential area'),
('Andheri', 'Andheri residential area'),
('Bandra', 'Bandra residential area'),
('Vile Parle', 'Vile Parle residential area');

INSERT IGNORE INTO waste_types
(name, description, price)
VALUES
('Wet Waste', 'Food scraps and biodegradable waste', 0),
('Dry Waste', 'Paper, cardboard and recyclable waste', 0),
('E-Waste', 'Electronic waste and small devices', 50),
('Plastic Waste', 'Plastic containers and packaging', 0),
('Garden Waste', 'Leaves and garden trimmings', 0);

SELECT * FROM areas;
SELECT * FROM waste_types;
SELECT * FROM bookings;


