const auditLogModel = require("../models/auditLogModel");

/**
 * Audit Log Middleware
 * Automatically logs CREATE, UPDATE, DELETE actions
 */
const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Capture response
    let responseData = null;

    res.json = function (data) {
      responseData = data;
      return originalJson(data);
    };

    res.send = function (data) {
      responseData = data;
      return originalSend(data);
    };

    // Wait for response
    res.on("finish", async () => {
      try {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const logData = {
            userId: req.user ? req.user.id : null,
            userName: req.user
              ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.username
              : "System",
            action,
            entityType,
            entityId: null,
            entityName: null,
            oldValues: null,
            newValues: null,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("user-agent"),
            description: null,
          };

          // Extract entity information from response
          if (responseData && typeof responseData === "object") {
            if (responseData.id) {
              logData.entityId = responseData.id;
              logData.entityName = responseData.name || responseData.orderNumber || responseData.invoiceNumber || null;
            }

            if (action === "CREATE") {
              logData.newValues = responseData;
              logData.description = `Created ${entityType}: ${logData.entityName || logData.entityId}`;
            } else if (action === "UPDATE") {
              logData.newValues = req.body;
              logData.entityId = req.params.id;
              logData.description = `Updated ${entityType}: ${req.params.id}`;
            } else if (action === "DELETE") {
              logData.entityId = req.params.id;
              logData.description = `Deleted ${entityType}: ${req.params.id}`;
            }
          }

          // Log asynchronously (don't wait)
          auditLogModel.create(logData).catch((error) => {
            console.error("Failed to create audit log:", error);
          });
        }
      } catch (error) {
        console.error("Audit log middleware error:", error);
      }
    });

    next();
  };
};

/**
 * Login audit log
 */
const logLogin = async (user, req) => {
  try {
    await auditLogModel.create({
      userId: user.id,
      userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
      action: "LOGIN",
      entityType: "auth",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
      description: `User logged in: ${user.email}`,
    });
  } catch (error) {
    console.error("Failed to log login:", error);
  }
};

/**
 * Logout audit log
 */
const logLogout = async (user, req) => {
  try {
    await auditLogModel.create({
      userId: user.id,
      userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
      action: "LOGOUT",
      entityType: "auth",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
      description: `User logged out: ${user.email}`,
    });
  } catch (error) {
    console.error("Failed to log logout:", error);
  }
};

module.exports = {
  auditLog,
  logLogin,
  logLogout,
};

