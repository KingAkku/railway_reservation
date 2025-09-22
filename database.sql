CREATE DATABASE IF NOT EXISTS railway_reservation;

CREATE USER 'adminuser'@'localhost' IDENTIFIED BY 'adminuser1234';
GRANT ALL PRIVILEGES ON railway_reservation.* TO 'adminuser'@'localhost';
FLUSH PRIVILEGES;

USE railway_reservation;

CREATE TABLE IF NOT EXISTS trains (
    train_no INT PRIMARY KEY,
    train_name VARCHAR(100) NOT NULL,
    from_station VARCHAR(100) NOT NULL,
    to_station VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    train_no INT NOT NULL,
    journey_date DATE NOT NULL,
    class_type VARCHAR(50) NOT NULL,
    seats_available INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (train_no) REFERENCES trains(train_no)
);

CREATE TABLE IF NOT EXISTS User_Data (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    user_phone VARCHAR(15),
    train_no INT NOT NULL,
    journey_date DATE NOT NULL,
    class_type VARCHAR(50) NOT NULL,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (train_no) REFERENCES trains(train_no)
);

INSERT INTO trains (train_no, train_name, from_station, to_station, departure_time, arrival_time, duration) VALUES
(12951, 'Rajdhani Express', 'Mumbai', 'New Delhi', '17:00:00', '08:32:00', '15h 32m'),
(12001, 'Shatabdi Express', 'New Delhi', 'Mumbai', '06:00:00', '13:45:00', '7h 45m'),
(22435, 'Vande Bharat Exp', 'Mumbai', 'New Delhi', '08:00:00', '14:00:00', '6h 00m'),
(12138, 'Punjab Mail', 'New Delhi', 'Mumbai', '05:15:00', '07:40:00', '26h 25m');

INSERT INTO availability (train_no, journey_date, class_type, seats_available, status) VALUES
(12951, CURDATE(), 'AC First Class (1A)', 45, 'Available-45'),
(12951, CURDATE(), 'AC 2-Tier (2A)', 120, 'Available-120'),
(22435, CURDATE(), 'AC First Class (1A)', 0, 'Regret'),
(22435, CURDATE(), 'Sleeper (SL)', 0, 'Regret'),
(12138, CURDATE(), 'Sleeper (SL)', 250, 'Available-250'),
(12001, CURDATE(), 'AC 2-Tier (2A)', 50, 'Waitlist-15');
