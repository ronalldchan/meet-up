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
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE availability (
    user_id INT NOT NULL,
    available DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
