require("dotenv").config();

const config = {
  server: {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    apiVersion: process.env.API_VERSION || "v1",
  },

  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "inventory_management",
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  cors: {
    allowedOrigins: ["http://localhost:5173", "http://localhost:3000"],
  },

  upload: {
    dir: "uploads",
    maxFileSize: 10485760,
  },

  isDevelopment() {
    return this.server.env === "development";
  },

  isProduction() {
    return this.server.env === "production";
  },
};

module.exports = config;

