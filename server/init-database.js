/**
 * Database Initialization Script
 * 
 * This script initializes the database with Sequelize:
 * - Tests connection
 * - Syncs all models (creates tables if they don't exist)
 * - Optionally seeds initial data
 * 
 * Usage:
 * node init-database.js           - Sync database (safe, doesn't drop tables)
 * node init-database.js --force   - Force sync (WARNING: drops all tables!)
 * node init-database.js --alter   - Alter tables to match models
 */

const database = require("./config/database");
const models = require("./models/index");

async function initializeDatabase() {
  try {
    console.log("🚀 Starting database initialization...\n");

    // Test connection
    console.log("📡 Testing database connection...");
    const connected = await database.testConnection();
    
    if (!connected) {
      console.error("\n❌ Database initialization failed: Cannot connect to database");
      process.exit(1);
    }

    // Get sync options from command line arguments
    const args = process.argv.slice(2);
    const syncOptions = {};

    if (args.includes("--force")) {
      console.log("\n⚠️  WARNING: Force sync will DROP ALL TABLES!");
      syncOptions.force = true;
    } else if (args.includes("--alter")) {
      console.log("\n📝 Using alter mode (modifies existing tables)");
      syncOptions.alter = true;
    } else {
      console.log("\n📝 Using safe sync mode (creates tables if they don't exist)");
    }

    // Sync all models
    console.log("\n🔄 Synchronizing database models...");
    await database.syncDatabase(syncOptions);

    // Display created tables
    console.log("\n✅ Database initialized successfully!\n");
    console.log("📊 Tables created/synchronized:");
    console.log("  - customers");
    console.log("  - suppliers");
    console.log("  - categories");
    console.log("  - products");
    console.log("  - sales_orders");
    console.log("  - sales_order_items");
    console.log("  - purchase_orders");
    console.log("  - purchase_order_items");
    console.log("  - invoices");
    console.log("  - invoice_items");
    console.log("  - stocks");

    // Optionally seed initial data
    if (args.includes("--seed")) {
      console.log("\n🌱 Seeding initial data...");
      await seedInitialData();
      console.log("✅ Initial data seeded successfully!");
    }

    console.log("\n🎉 Database is ready to use!");
    console.log("\nYou can now start the server with: npm run dev\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database initialization failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Seed initial data (optional)
 */
async function seedInitialData() {
  const { Customer, Supplier, Category, Product } = models;

  try {
    // Check if data already exists
    const categoriesCount = await Category.count();
    
    if (categoriesCount > 0) {
      console.log("  ℹ️  Data already exists, skipping seed...");
      return;
    }

    // Create sample customers
    await Customer.create({
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1-555-0101",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      status: "active",
    });

    await Customer.create({
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1-555-0202",
      address: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      status: "active",
    });

    console.log("  ✅ Sample customers created");

    // Create sample suppliers
    await Supplier.create({
      name: "Tech Supplies Co.",
      email: "orders@techsupplies.com",
      phone: "+1-555-1001",
      address: "100 Tech Park",
      city: "San Francisco",
      state: "CA",
      zipCode: "94101",
      status: "active",
    });

    await Supplier.create({
      name: "Office Depot Pro",
      email: "sales@officedepot.com",
      phone: "+1-555-2002",
      address: "200 Business Center",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      status: "active",
    });

    console.log("  ✅ Sample suppliers created");

    // Create sample categories
    const electronics = await Category.create({
      name: "Electronics",
      description: "Electronic devices and accessories",
    });

    const clothing = await Category.create({
      name: "Clothing",
      description: "Apparel and fashion items",
    });

    const food = await Category.create({
      name: "Food & Beverages",
      description: "Food items and drinks",
    });

    // Create sample products
    await Product.create({
      name: "Laptop",
      categoryId: electronics.id,
      sku: "ELEC-001",
      description: "High-performance laptop",
      price: 999.99,
      cost: 750.00,
      stock: 50,
      minStock: 10,
      unit: "pcs",
    });

    await Product.create({
      name: "T-Shirt",
      categoryId: clothing.id,
      sku: "CLTH-001",
      description: "Cotton t-shirt",
      price: 19.99,
      cost: 10.00,
      stock: 200,
      minStock: 50,
      unit: "pcs",
    });

    await Product.create({
      name: "Coffee Beans",
      categoryId: food.id,
      sku: "FOOD-001",
      description: "Premium coffee beans",
      price: 15.99,
      cost: 8.00,
      stock: 100,
      minStock: 20,
      unit: "kg",
    });

    console.log("  ✅ Created 3 categories and 3 products");
  } catch (error) {
    console.error("  ❌ Seed failed:", error.message);
    throw error;
  }
}

// Run initialization
initializeDatabase();

