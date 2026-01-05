require("dotenv").config();

function getServerBaseUrl() {
  const env = process.env.NODE_ENV || "development";
  const port = parseInt(process.env.PORT || "3000", 10);
  const host = process.env.SERVER_HOST || "localhost";
  const protocol = (env === "production" && host !== "localhost") 
    ? (process.env.SERVER_PROTOCOL || "https") 
    : "http";
  
  if (env === "production" && host !== "localhost") {
    const isStandardPort = port === 80 || port === 443;
    return isStandardPort ? `${protocol}://${host}` : `${protocol}://${host}:${port}`;
  }
  
  return `${protocol}://${host}:${port}`;
}

const config = {
  server: {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    apiVersion: process.env.API_VERSION || "v1",
    baseUrl: getServerBaseUrl(),
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
    allowedOrigins: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
      : ["http://localhost:5173", "http://localhost:3000"],
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

