const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Return = sequelize.define(
  "Return",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    returnNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    returnType: {
      type: DataTypes.ENUM("sales_return", "purchase_return"),
      allowNull: false,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true, // Can be sales_order or purchase_order
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "invoices",
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
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "suppliers",
        key: "id",
      },
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
      defaultValue: "pending",
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    refundAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    refundMethod: {
      type: DataTypes.ENUM("cash", "card", "bank_transfer", "store_credit", "other"),
      allowNull: true,
    },
    refundDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    restockItems: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "returns",
    timestamps: true,
  }
);

// Model methods
class ReturnModel {
  async getAll() {
    try {
      const returns = await Return.findAll({
        order: [["returnDate", "DESC"]],
      });
      return returns;
    } catch (error) {
      throw new Error(`Error fetching returns: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const returnRecord = await Return.findByPk(id);
      return returnRecord;
    } catch (error) {
      throw new Error(`Error fetching return: ${error.message}`);
    }
  }

  async getByType(returnType) {
    try {
      const returns = await Return.findAll({
        where: { returnType },
        order: [["returnDate", "DESC"]],
      });
      return returns;
    } catch (error) {
      throw new Error(`Error fetching returns by type: ${error.message}`);
    }
  }

  async getByCustomer(customerId) {
    try {
      const returns = await Return.findAll({
        where: { customerId },
        order: [["returnDate", "DESC"]],
      });
      return returns;
    } catch (error) {
      throw new Error(`Error fetching customer returns: ${error.message}`);
    }
  }

  async getBySupplier(supplierId) {
    try {
      const returns = await Return.findAll({
        where: { supplierId },
        order: [["returnDate", "DESC"]],
      });
      return returns;
    } catch (error) {
      throw new Error(`Error fetching supplier returns: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const returnRecord = await Return.create(data);
      return returnRecord;
    } catch (error) {
      throw new Error(`Error creating return: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const returnRecord = await Return.findByPk(id);
      if (!returnRecord) {
        throw new Error("Return not found");
      }

      await returnRecord.update(data);
      return returnRecord;
    } catch (error) {
      throw new Error(`Error updating return: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const returnRecord = await Return.findByPk(id);
      if (!returnRecord) {
        throw new Error("Return not found");
      }

      await returnRecord.destroy();
      return { message: "Return deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting return: ${error.message}`);
    }
  }

  async approve(id, userId) {
    try {
      const returnRecord = await Return.findByPk(id);
      if (!returnRecord) {
        throw new Error("Return not found");
      }

      await returnRecord.update({
        status: "approved",
        processedBy: userId,
      });
      return returnRecord;
    } catch (error) {
      throw new Error(`Error approving return: ${error.message}`);
    }
  }

  async complete(id, refundData) {
    try {
      const returnRecord = await Return.findByPk(id);
      if (!returnRecord) {
        throw new Error("Return not found");
      }

      await returnRecord.update({
        status: "completed",
        refundAmount: refundData.refundAmount,
        refundMethod: refundData.refundMethod,
        refundDate: new Date(),
      });
      return returnRecord;
    } catch (error) {
      throw new Error(`Error completing return: ${error.message}`);
    }
  }
}

module.exports = new ReturnModel();
module.exports.Return = Return;

