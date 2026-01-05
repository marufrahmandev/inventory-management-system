const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "invoices",
        key: "id",
      },
    },
    paymentNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "bank_transfer", "check", "online", "other"),
      defaultValue: "cash",
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    receivedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

// Model methods
class PaymentModel {
  async getAll() {
    try {
      const payments = await Payment.findAll({
        order: [["paymentDate", "DESC"]],
      });
      return payments;
    } catch (error) {
      throw new Error(`Error fetching payments: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const payment = await Payment.findByPk(id);
      return payment;
    } catch (error) {
      throw new Error(`Error fetching payment: ${error.message}`);
    }
  }

  async getByInvoiceId(invoiceId) {
    try {
      const payments = await Payment.findAll({
        where: { invoiceId },
        order: [["paymentDate", "DESC"]],
      });
      return payments;
    } catch (error) {
      throw new Error(`Error fetching payments for invoice: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const payment = await Payment.create(data);
      return payment;
    } catch (error) {
      throw new Error(`Error creating payment: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const payment = await Payment.findByPk(id);
      if (!payment) {
        throw new Error("Payment not found");
      }

      await payment.update(data);
      return payment;
    } catch (error) {
      throw new Error(`Error updating payment: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const payment = await Payment.findByPk(id);
      if (!payment) {
        throw new Error("Payment not found");
      }

      await payment.destroy();
      return { message: "Payment deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting payment: ${error.message}`);
    }
  }

  async getTotalByInvoice(invoiceId) {
    try {
      const result = await Payment.sum("amount", {
        where: { invoiceId },
      });
      return result || 0;
    } catch (error) {
      throw new Error(`Error calculating total payments: ${error.message}`);
    }
  }
}

module.exports = new PaymentModel();
module.exports.Payment = Payment;

