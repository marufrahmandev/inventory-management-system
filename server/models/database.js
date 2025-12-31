/**
 * Legacy database.js - kept for backward compatibility
 * 
 * Note: This file is no longer used with Sequelize ORM.
 * All database operations now go through Sequelize models.
 * 
 * For new code, use:
 * - const database = require("../config/database");
 * - const { Model } = require("./index");
 */

const database = require("../config/database");

module.exports = {
  // Export Sequelize instance for legacy code
  sequelize: database.getSequelize(),
  
  // Transaction helper
  transaction: async (callback) => {
    return await database.transaction(callback);
  },
  
  // Connection test
  testConnection: async () => {
    return await database.testConnection();
  },
};
