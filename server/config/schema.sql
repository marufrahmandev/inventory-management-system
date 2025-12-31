-- Create Database
CREATE DATABASE IF NOT EXISTS inventory_management;
USE inventory_management;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_category VARCHAR(36),
  category_image VARCHAR(500),
  optimizedImageUrl VARCHAR(500),
  secureUrl VARCHAR(500),
  publicId VARCHAR(255),
  imagesDisplayName VARCHAR(255),
  imageUrl VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_category (parent_category),
  INDEX idx_name (name)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  categoryId VARCHAR(36),
  sku VARCHAR(100),
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  stock INT DEFAULT 0,
  minStock INT DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  barcode VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category (categoryId),
  INDEX idx_sku (sku),
  INDEX idx_name (name),
  INDEX idx_stock (stock)
);

-- Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
  id VARCHAR(36) PRIMARY KEY,
  orderNumber VARCHAR(100) NOT NULL UNIQUE,
  customerName VARCHAR(255) NOT NULL,
  customerEmail VARCHAR(255),
  customerPhone VARCHAR(50),
  customerAddress TEXT,
  orderDate DATETIME NOT NULL,
  deliveryDate DATETIME,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_number (orderNumber),
  INDEX idx_customer (customerName),
  INDEX idx_status (status),
  INDEX idx_order_date (orderDate)
);

-- Sales Order Items Table
CREATE TABLE IF NOT EXISTS sales_order_items (
  id VARCHAR(36) PRIMARY KEY,
  salesOrderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  productName VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salesOrderId) REFERENCES sales_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_sales_order (salesOrderId),
  INDEX idx_product (productId)
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(36) PRIMARY KEY,
  orderNumber VARCHAR(100) NOT NULL UNIQUE,
  supplierName VARCHAR(255) NOT NULL,
  supplierEmail VARCHAR(255),
  supplierPhone VARCHAR(50),
  supplierAddress TEXT,
  orderDate DATETIME NOT NULL,
  expectedDate DATETIME,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'ordered', 'received', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_number (orderNumber),
  INDEX idx_supplier (supplierName),
  INDEX idx_status (status),
  INDEX idx_order_date (orderDate)
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id VARCHAR(36) PRIMARY KEY,
  purchaseOrderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  productName VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchaseOrderId) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_purchase_order (purchaseOrderId),
  INDEX idx_product (productId)
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(36) PRIMARY KEY,
  invoiceNumber VARCHAR(100) NOT NULL UNIQUE,
  salesOrderId VARCHAR(36),
  customerName VARCHAR(255) NOT NULL,
  customerEmail VARCHAR(255),
  customerPhone VARCHAR(50),
  customerAddress TEXT,
  invoiceDate DATETIME NOT NULL,
  dueDate DATETIME,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  paidAmount DECIMAL(10, 2) DEFAULT 0,
  status ENUM('paid', 'unpaid', 'partial', 'overdue') DEFAULT 'unpaid',
  paymentMethod VARCHAR(100),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (salesOrderId) REFERENCES sales_orders(id) ON DELETE SET NULL,
  INDEX idx_invoice_number (invoiceNumber),
  INDEX idx_customer (customerName),
  INDEX idx_status (status),
  INDEX idx_invoice_date (invoiceDate),
  INDEX idx_due_date (dueDate)
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id VARCHAR(36) PRIMARY KEY,
  invoiceId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  productName VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_invoice (invoiceId),
  INDEX idx_product (productId)
);

-- Stocks Table
CREATE TABLE IF NOT EXISTS stocks (
  id VARCHAR(36) PRIMARY KEY,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  location VARCHAR(255),
  warehouseSection VARCHAR(255),
  batchNumber VARCHAR(100),
  expiryDate DATE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (productId),
  INDEX idx_location (location),
  INDEX idx_batch (batchNumber),
  INDEX idx_expiry (expiryDate)
);

-- Create initial admin category (optional)
INSERT INTO categories (id, name, description, parent_category) 
VALUES ('default-1', 'General', 'Default category', NULL)
ON DUPLICATE KEY UPDATE name=name;

