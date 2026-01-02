const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "USA",
    },
    taxId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    creditLimit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    paymentTerms: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    currentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "blocked"),
      defaultValue: "active",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "customers",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
        where: {
          email: {
            [require("sequelize").Op.ne]: null,
          },
        },
      },
    ],
  }
);

// Model methods
class CustomerModel {
  async getAll() {
    try {
      const customers = await Customer.findAll({
        order: [["createdAt", "DESC"]],
      });
      // Convert Sequelize instances to plain objects
      return customers.map(customer => customer.get({ plain: true }));
    } catch (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return null;
      }
      return customer.get({ plain: true }); // Return plain object
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const customer = await Customer.create(data);
      return customer.get({ plain: true }); // Return plain object
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      console.log("Model update - received data:", JSON.stringify(data, null, 2));
      await customer.update(data);
      await customer.reload(); // Reload to get updated data
      const updated = customer.get({ plain: true });
      console.log("Model update - after reload, paymentTerms:", updated.paymentTerms);
      return updated; // Return plain object
    } catch (error) {
      console.error("Model update error:", error);
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      await customer.destroy();
      return { message: "Customer deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting customer: ${error.message}`);
    }
  }

  async updateBalance(id, amount) {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      const newBalance = parseFloat(customer.currentBalance) + parseFloat(amount);
      await customer.update({ currentBalance: newBalance });
      return customer;
    } catch (error) {
      throw new Error(`Error updating customer balance: ${error.message}`);
    }
  }
}

module.exports = new CustomerModel();
module.exports.Customer = Customer;

