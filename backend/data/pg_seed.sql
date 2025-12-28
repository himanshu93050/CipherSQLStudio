-- Postgres seed for CipherSQLStudio sample questions
-- Drops existing tables and creates minimal schema used by sample tests

-- Drop in dependency order
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  dept_name TEXT NOT NULL,
  location TEXT
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary NUMERIC,
  dept_id INTEGER REFERENCES departments(id)
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price NUMERIC
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  order_date DATE,
  total NUMERIC
);

-- Insert rows that match the expectedResult tests in sampleData
INSERT INTO departments (id, dept_name, location) VALUES
  (1, 'HR', 'HQ'),
  (2, 'Engineering', 'HQ');

INSERT INTO employees (id, name, salary, dept_id) VALUES
  (1, 'Alice', 50000, 1),
  (2, 'Bob', 60000, 2);

INSERT INTO customers (id, first_name, last_name, email) VALUES
  (1, 'John', 'Doe', 'john@example.com'),
  (2, 'Jane', 'Smith', 'jane@example.com');

INSERT INTO products (id, name, price) VALUES
  (1, 'Widget', 9.99),
  (2, 'Gadget', 19.95);

INSERT INTO orders (id, customer_id, order_date, total) VALUES
  (1, 1, '2025-01-01', 100.0),
  (2, 2, '2025-02-01', 250.5);

-- Optional: update sequences if using SERIAL in other setups
-- SELECT setval(pg_get_serial_sequence('departments','id'), (SELECT MAX(id) FROM departments));
