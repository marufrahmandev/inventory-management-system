const express = require("express");
const cors = require("cors");
const config = require("./config/env.config");
const database = require("./config/database");
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors({ origin: config.cors.allowedOrigins, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(config.upload.dir));

// Development logging
if (config.isDevelopment()) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use("/", routes);

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Async server startup with database connection test
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await database.testConnection();
    
    if (!dbConnected) {
      console.error("\n❌ Failed to connect to database. Server not started.");
      console.error("Please ensure MySQL is running and .env is configured correctly.\n");
      process.exit(1);
    }

    // Start server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: MySQL (Sequelize ORM)`);
      console.log(`🔗 API: /api/${config.server.apiVersion}\n`);
    });
  } catch (error) {
    console.error("\n❌ Error starting server:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await database.closeConnection();
  process.exit(0);
});

module.exports = app;
