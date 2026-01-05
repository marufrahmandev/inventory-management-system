const database = require("../config/database");
const { DataTypes } = require("sequelize");

const sequelize = database.getSequelize();

/**
 * Define all Sequelize models
 * Following best practices with proper associations and validations
 */

// Customer Model
const Customer = sequelize.define("customers", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: "USA",
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  creditLimit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  paymentTerms: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  currentBalance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "blocked"),
    defaultValue: "active",
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Supplier Model
const Supplier = sequelize.define("suppliers", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: "USA",
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  paymentTerms: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  bankDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  currentBalance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "blocked"),
    defaultValue: "active",
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Category Model
const Category = sequelize.define("categories", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parent_category: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "categories",
      key: "id",
    },
  },
  category_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  optimizedImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  secureUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  publicId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  imagesDisplayName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
});

// Product Model
const Product = sequelize.define("products", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "categories",
      key: "id",
    },
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  unit: {
    type: DataTypes.STRING(50),
    defaultValue: "pcs",
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  // Product Image (Required - Main Image)
  product_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  product_image_optimizedUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  product_image_secureUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  product_image_publicId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  product_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  // Product Gallery (Optional - Multiple Images)
  product_gallery: {
    type: DataTypes.TEXT,
    allowNull: true,
    // Store as JSON string: [{"url": "...", "publicId": "...", ...}, ...]
    get() {
      const value = this.getDataValue("product_gallery");
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue("product_gallery", value ? JSON.stringify(value) : null);
    },
  },
});

// Sales Order Model
const SalesOrder = sequelize.define("sales_orders", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "customers",
      key: "id",
    },
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  customerPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "processing", "completed", "cancelled"),
    defaultValue: "pending",
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Sales Order Item Model
const SalesOrderItem = sequelize.define("sales_order_items", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  salesOrderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "sales_orders",
      key: "id",
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "products",
      key: "id",
    },
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

// Purchase Order Model
const PurchaseOrder = sequelize.define("purchase_orders", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "suppliers",
      key: "id",
    },
  },
  supplierName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  supplierEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  supplierPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  supplierAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  expectedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("pending", "ordered", "received", "cancelled"),
    defaultValue: "pending",
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Purchase Order Item Model
const PurchaseOrderItem = sequelize.define("purchase_order_items", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  purchaseOrderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "purchase_orders",
      key: "id",
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "products",
      key: "id",
    },
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

// Invoice Model
const Invoice = sequelize.define("invoices", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  salesOrderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "sales_orders",
      key: "id",
    },
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "customers",
      key: "id",
    },
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  customerPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  invoiceDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("paid", "unpaid", "partial", "overdue"),
    defaultValue: "unpaid",
  },
  paymentMethod: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Invoice Item Model
const InvoiceItem = sequelize.define("invoice_items", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "invoices",
      key: "id",
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "products",
      key: "id",
    },
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

// Stock Model
const Stock = sequelize.define("stocks", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "products",
      key: "id",
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  warehouseSection: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  batchNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Define Associations
// Category self-reference
Category.hasMany(Category, { as: "children", foreignKey: "parent_category" });
Category.belongsTo(Category, { as: "parent", foreignKey: "parent_category" });

// Category - Product
Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "SET NULL" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

// Customer - Sales Order
Customer.hasMany(SalesOrder, { foreignKey: "customerId", onDelete: "SET NULL" });
SalesOrder.belongsTo(Customer, { foreignKey: "customerId" });

// Customer - Invoice
Customer.hasMany(Invoice, { foreignKey: "customerId", onDelete: "SET NULL" });
Invoice.belongsTo(Customer, { foreignKey: "customerId" });

// Supplier - Purchase Order
Supplier.hasMany(PurchaseOrder, { foreignKey: "supplierId", onDelete: "SET NULL" });
PurchaseOrder.belongsTo(Supplier, { foreignKey: "supplierId" });

// Sales Order - Sales Order Items
SalesOrder.hasMany(SalesOrderItem, { as: "items", foreignKey: "salesOrderId", onDelete: "CASCADE" });
SalesOrderItem.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });
SalesOrderItem.belongsTo(Product, { foreignKey: "productId" });

// Purchase Order - Purchase Order Items
PurchaseOrder.hasMany(PurchaseOrderItem, { as: "items", foreignKey: "purchaseOrderId", onDelete: "CASCADE" });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
PurchaseOrderItem.belongsTo(Product, { foreignKey: "productId" });

// Invoice - Invoice Items
Invoice.hasMany(InvoiceItem, { as: "items", foreignKey: "invoiceId", onDelete: "CASCADE" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });
InvoiceItem.belongsTo(Product, { foreignKey: "productId" });

// Sales Order - Invoice
SalesOrder.hasMany(Invoice, { foreignKey: "salesOrderId", onDelete: "SET NULL" });
Invoice.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });

// Product - Stock
Product.hasMany(Stock, { foreignKey: "productId", onDelete: "CASCADE" });
Stock.belongsTo(Product, { foreignKey: "productId" });

// User Model
const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "manager", "staff", "viewer"),
    defaultValue: "staff",
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: "users",
});

// Export all models
module.exports = {
  sequelize,
  User,
  Customer,
  Supplier,
  Category,
  Product,
  SalesOrder,
  SalesOrderItem,
  PurchaseOrder,
  PurchaseOrderItem,
  Invoice,
  InvoiceItem,
  Stock,
};

