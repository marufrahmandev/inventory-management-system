const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Supplier = sequelize.define(
  "Supplier",
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
    paymentTerms: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bankDetails: {
      type: DataTypes.TEXT,
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
    tableName: "suppliers",
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
class SupplierModel {
  async getAll() {
    try {
      const suppliers = await Supplier.findAll({
        order: [["createdAt", "DESC"]],
      });
      // Convert Sequelize instances to plain objects
      return suppliers.map(supplier => supplier.get({ plain: true }));
    } catch (error) {
      throw new Error(`Error fetching suppliers: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return null;
      }
      return supplier.get({ plain: true }); // Return plain object
    } catch (error) {
      throw new Error(`Error fetching supplier: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const supplier = await Supplier.create(data);
      return supplier.get({ plain: true }); // Return plain object
    } catch (error) {
      throw new Error(`Error creating supplier: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        throw new Error("Supplier not found");
      }

      await supplier.update(data);
      await supplier.reload(); // Reload to get updated data
      return supplier.get({ plain: true }); // Return plain object
    } catch (error) {
      throw new Error(`Error updating supplier: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        throw new Error("Supplier not found");
      }

      await supplier.destroy();
      return { message: "Supplier deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting supplier: ${error.message}`);
    }
  }

  async updateBalance(id, amount) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        throw new Error("Supplier not found");
      }

      const newBalance = parseFloat(supplier.currentBalance) + parseFloat(amount);
      await supplier.update({ currentBalance: newBalance });
      return supplier;
    } catch (error) {
      throw new Error(`Error updating supplier balance: ${error.message}`);
    }
  }
}

module.exports = new SupplierModel();
module.exports.Supplier = Supplier;

