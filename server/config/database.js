const { Sequelize } = require("sequelize");
require("dotenv").config();

/**
 * Sequelize Database Connection with Singleton Pattern
 * 
 * This ensures only one database connection instance exists throughout the application lifecycle.
 * Production-ready configuration with connection pooling, retry logic, and proper error handling.
 */
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.sequelize = new Sequelize(
      process.env.DB_NAME || "inventory_management",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        
        // Connection Pool Configuration (Production-Ready)
        pool: {
          max: 10,              // Maximum number of connections
          min: 0,               // Minimum number of connections
          acquire: 30000,       // Maximum time (ms) to get connection before throwing error
          idle: 10000,          // Maximum time (ms) a connection can be idle before being released
        },

        // Logging Configuration
        logging: process.env.NODE_ENV === "production" ? false : console.log,
        
        // Performance & Reliability Settings
        retry: {
          max: 3,               // Retry failed queries 3 times
          match: [
            Sequelize.ConnectionError,
            Sequelize.ConnectionTimedOutError,
          ],
        },
        
        // Query timeout
        dialectOptions: {
          connectTimeout: 60000, // 60 seconds
          decimalNumbers: true,  // Parse DECIMAL and NEWDECIMAL as numbers
        },

        // Timezone settings
        timezone: "+00:00",      // UTC timezone

        // Model configuration defaults
        define: {
          timestamps: true,      // Automatically add createdAt and updatedAt
          underscored: false,    // Use camelCase instead of snake_case
          freezeTableName: true, // Prevent pluralization of table names
          charset: "utf8mb4",    // Support emoji and special characters
          collate: "utf8mb4_unicode_ci",
        },

        // Benchmark queries in development
        benchmark: process.env.NODE_ENV !== "production",
      }
    );

    Database.instance = this;
  }

  /**
   * Get Sequelize instance
   */
  getSequelize() {
    return this.sequelize;
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log("✅ MySQL Database connected successfully (Sequelize ORM)");
      return true;
    } catch (error) {
      console.error("❌ MySQL Database connection failed:", error.message);
      console.error("Please ensure MySQL is running and credentials are correct in .env file");
      return false;
    }
  }

  /**
   * Sync all models with database
   * @param {Object} options - Sequelize sync options
   */
  async syncDatabase(options = {}) {
    try {
      await this.sequelize.sync(options);
      console.log("✅ Database synchronized successfully");
      return true;
    } catch (error) {
      console.error("❌ Database synchronization failed:", error.message);
      return false;
    }
  }

  /**
   * Close database connection
   */
  async closeConnection() {
    try {
      await this.sequelize.close();
      console.log("✅ Database connection closed");
      return true;
    } catch (error) {
      console.error("❌ Error closing database connection:", error.message);
      return false;
    }
  }

  /**
   * Execute a raw query (use sparingly, prefer Sequelize ORM methods)
   */
  async query(sql, options = {}) {
    try {
      return await this.sequelize.query(sql, {
        type: Sequelize.QueryTypes.SELECT,
        ...options,
      });
    } catch (error) {
      console.error("Query error:", error.message);
      throw error;
    }
  }

  /**
   * Start a transaction
   */
  async transaction(callback) {
    return await this.sequelize.transaction(callback);
  }
}

// Create singleton instance
const database = new Database();

// Test connection on startup
database.testConnection();

module.exports = database;
