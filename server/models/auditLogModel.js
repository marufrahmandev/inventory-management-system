const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    action: {
      type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "VIEW"),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    entityName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    oldValues: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    newValues: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false, // Audit logs should be immutable
  }
);

// Model methods
class AuditLogModel {
  async getAll(limit = 100, offset = 0) {
    try {
      const logs = await AuditLog.findAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      return logs;
    } catch (error) {
      throw new Error(`Error fetching audit logs: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const log = await AuditLog.findByPk(id);
      return log;
    } catch (error) {
      throw new Error(`Error fetching audit log: ${error.message}`);
    }
  }

  async getByUser(userId, limit = 50) {
    try {
      const logs = await AuditLog.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit,
      });
      return logs;
    } catch (error) {
      throw new Error(`Error fetching user audit logs: ${error.message}`);
    }
  }

  async getByEntity(entityType, entityId, limit = 50) {
    try {
      const logs = await AuditLog.findAll({
        where: { entityType, entityId },
        order: [["createdAt", "DESC"]],
        limit,
      });
      return logs;
    } catch (error) {
      throw new Error(`Error fetching entity audit logs: ${error.message}`);
    }
  }

  async getByAction(action, limit = 100) {
    try {
      const logs = await AuditLog.findAll({
        where: { action },
        order: [["createdAt", "DESC"]],
        limit,
      });
      return logs;
    } catch (error) {
      throw new Error(`Error fetching action audit logs: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const log = await AuditLog.create(data);
      return log;
    } catch (error) {
      console.error("Error creating audit log:", error);
      // Don't throw error to prevent audit log failures from breaking operations
      return null;
    }
  }

  // Helper method to log any action
  async log({
    userId,
    userName,
    action,
    entityType,
    entityId,
    entityName,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
    description,
  }) {
    try {
      return await this.create({
        userId,
        userName,
        action,
        entityType,
        entityId,
        entityName,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
        description,
      });
    } catch (error) {
      console.error("Error logging audit:", error);
      return null;
    }
  }
}

module.exports = new AuditLogModel();
module.exports.AuditLog = AuditLog;

