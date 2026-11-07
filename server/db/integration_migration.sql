USE waste_collection;

-- 1. Align user password column with Member 1 authentication
ALTER TABLE users
CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL;

-- 2. Add Member 1 user profile fields
ALTER TABLE users
ADD COLUMN phone CHAR(10) NOT NULL,
ADD COLUMN address VARCHAR(255) NULL;

-- 3. Add Member 1 area pincode field.
-- Nullable because existing 4 areas do not have pincodes yet.
ALTER TABLE areas
ADD COLUMN pincode CHAR(6) NULL;

-- 4. Add Member 1 messages functionality
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
