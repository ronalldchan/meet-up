CREATE TABLE events (
    event_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE event_dates (
    event_id INT,
    event_date DATE,
    PRIMARY KEY (event_id, event_date),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE users (
    user_id INT PRIMARY KEY,
    event_id INT not NULL,
    name VARCHAR(64) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    UNIQUE (event_id, name)
);

CREATE TABLE availability (
    user_id INT NOT NULL,
    available DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    unique (user_id, available)
);

insert into events values 
(1, 'My First Event', '09:00', '12:00'),
(2, 'Test Event 2', '09:00', '12:00'),
(3, 'Test Event 3', '09:00', '12:00');

insert into event_dates values 
(1, '2024-08-11'),
(1, '2024-08-12'),
(1, '2024-08-13');

insert into users values
(1, 1, 'Ronald'),
(2, 1, 'Brad'),
(3, 1, 'Brandon'),
(4, 2, 'Jimmy'),
(5, 2, 'Andrew'),
(6, 2, 'Clive');

insert into availability values
(1, '2024-08-11 09:00:00'),
(1, '2024-08-11 09:01:00');
