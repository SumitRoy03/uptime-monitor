
CREATE TABLE IF NOT EXISTS targets (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'UNKNOWN',
    last_checked TIMESTAMP
);

INSERT INTO targets (url) VALUES ('https://www.google.com');