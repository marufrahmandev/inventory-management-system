const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("low_stock", "expiring_stock", "order_pending", "payment_received", "system", "other"),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("info", "warning", "error", "success"),
      defaultValue: "info",
    },
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actionUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    recipientRole: {
      type: DataTypes.ENUM("all", "admin", "manager", "staff"),
      defaultValue: "all",
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
  }
);

// Model methods
class NotificationModel {
  async getAll(isRead = null, limit = 50, offset = 0) {
    try {
      const where = {};
      if (isRead !== null) {
        where.isRead = isRead;
      }

      const notifications = await Notification.findAll({
        where,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      return notifications;
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const notification = await Notification.findByPk(id);
      return notification;
    } catch (error) {
      throw new Error(`Error fetching notification: ${error.message}`);
    }
  }

  async getUnread(limit = 50) {
    try {
      const notifications = await Notification.findAll({
        where: { isRead: false },
        order: [["createdAt", "DESC"]],
        limit,
      });
      return notifications;
    } catch (error) {
      throw new Error(`Error fetching unread notifications: ${error.message}`);
    }
  }

  async getUnreadCount() {
    try {
      const count = await Notification.count({
        where: { isRead: false },
      });
      return count;
    } catch (error) {
      throw new Error(`Error fetching unread count: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const notification = await Notification.create(data);
      return notification;
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  async markAsRead(id) {
    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.update({
        isRead: true,
        readAt: new Date(),
      });
      return notification;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  async markAllAsRead() {
    try {
      await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { isRead: false } }
      );
      return { message: "All notifications marked as read" };
    } catch (error) {
      throw new Error(`Error marking all as read: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.destroy();
      return { message: "Notification deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  async deleteOld(daysOld = 30) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - daysOld);

      const count = await Notification.destroy({
        where: {
          createdAt: { [require("sequelize").Op.lt]: date },
          isRead: true,
        },
      });
      return { message: `Deleted ${count} old notifications` };
    } catch (error) {
      throw new Error(`Error deleting old notifications: ${error.message}`);
    }
  }

  // Helper method to create low stock alert
  async createLowStockAlert(productId, productName, currentStock, minStock) {
    try {
      return await this.create({
        type: "low_stock",
        title: "Low Stock Alert",
        message: `${productName} is running low. Current stock: ${currentStock}, Minimum: ${minStock}`,
        severity: "warning",
        entityType: "product",
        entityId: productId,
        recipientRole: "manager",
        actionUrl: `/products/${productId}`,
      });
    } catch (error) {
      console.error("Error creating low stock alert:", error);
      return null;
    }
  }
}

module.exports = new NotificationModel();
module.exports.Notification = Notification;

