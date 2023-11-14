
-- Creazione della tabella "pages"
DROP TABLE IF EXISTS pages;
CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255),
  authorId INT,
  dateOfCreation DATE,
  dateOfPublication DATE,
  FOREIGN KEY (authorId) REFERENCES users(id)
);

-- Creazione della tabella "contents"
DROP TABLE IF EXISTS contents;
CREATE TABLE contents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pageId INT,
  nOrder INT,
  type VARCHAR(255),
  value TEXT,
  FOREIGN KEY (pageId) REFERENCES pages(id)
);

-- Creazione della tabella "users"
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255),
  name VARCHAR(255),
  hash VARCHAR(255),
  salt VARCHAR(255),
  admin BOOLEAN
);

-- Creazione della tabella "system_settings"
DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
  name VARCHAR(255) PRIMARY KEY
);

-- Popolamento 
INSERT INTO users (email, name, hash, salt, admin) VALUES
  ('goku@email.com', 'goku95', 'c0e2024a9fa210ea5a67bcd3cf1730c7a76fc861689a433a674d5eec4a0ae56a', 'a', 0),
  ('freezer@email.com', 'freezer', '99438c3b0151d0d36f18d043f44c234da37f31b5c3642d9893529e9d219bc89f', 'b', 0),
  ('bulma@email.com', 'bulma', 'bb07535eaa59761123a2b0f4c26c3a91c175e906f6dfafc02a7cc618abaf6168', 'c', 1),
  ('junior@email.com', 'junior', 'd5e88d9c3ddc9a2a96965e3b6f83ceed5384a3d1141d11a2be1fd77d58853852', 'd', 0);

-- Populating the pages table
INSERT INTO pages (title, authorId, dateOfCreation, dateOfPublication) VALUES
  ('Page 1', 1, '2023-06-01', '2023-06-02'),
  ('Page 2', 1, '2023-06-02', '2023-06-03'),
  ('Page 3', 3, '2023-06-03', NULL),
  ('Page 4', 3, '2023-06-04', NULL),
  ('Page 5', 3, '2023-06-04', '2023-06-06'),
  ('Page 6', 3, '2023-06-14', '2023-06-15'),
  ('Page 7', 3, '2023-06-04', '2025-06-06'),
  ('Page 8', 3, '2023-06-04', '2025-06-06');
  
-- Populating the contents table
INSERT INTO contents (pageId, nOrder, type, value) VALUES
  (1, 0, 'header', 'Content 1 for Page 1'),
  (1, 1, 'paragraph', 'Content 2 for Page 1'),
  (2, 0, 'header', 'Content 1 for Page 2'),
  (2, 1, 'paragraph', 'Content 2 for Page 2'),
  (3, 0, 'header', 'Content 1 for Page 3'),
  (3, 1, 'paragraph', 'Content 2 for Page 3'),
  (4, 0, 'header', 'Content 1 for Page 4'),
  (4, 1, 'paragraph', 'Content 2 for Page 4'),
  (5, 0, 'header', 'Content 1 for Page 5'),
  (5, 1, 'paragraph', 'Content 2 for Page 5'),
  (6, 0, 'header', 'Content 1 for Page 6'),
  (6, 1, 'paragraph', 'Content 2 for Page 6'),
  (7, 0, 'header', 'Content 1 for Page 7'),
  (7, 1, 'paragraph', 'Content 2 for Page 7'),
  (8, 0, 'header', 'Content 1 for Page 8'),
  (8, 1, 'paragraph', 'Content 2 for Page 8');

-- Populating the system_settings table
INSERT INTO system_settings (name) VALUES ('CMSmall');

