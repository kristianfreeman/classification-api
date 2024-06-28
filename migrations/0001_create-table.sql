-- Migration number: 0001 	 2024-06-28T15:18:52.499Z
DROP TABLE IF EXISTS classifications;
CREATE TABLE classifications (id INTEGER PRIMARY KEY, text TEXT UNIQUE);