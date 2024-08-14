CREATE TABLE events (
    event_id INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    timezone VARCHAR(64) NOT NULL
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
(1, 'My First Event', '2024-08-11 09:00:00', '2024-08-18 09:00:00', 'America/New_York'),
(2, 'Test Event 2', '2024-08-11 09:00:00', '2024-08-12 09:00:00', 'America/New_York'),
(3, 'Test Event3', '2024-08-11 09:00:00', '2024-08-10 09:00:00', 'America/New_York');

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
