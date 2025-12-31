const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Settings = sequelize.define(
  "Settings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "My Company",
    },
    companyEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    companyPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    companyAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    companyCity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    companyState: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    companyZipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    companyCountry: {
      type: DataTypes.STRING(100),
      defaultValue: "USA",
    },
    taxId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    companyLogo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "USD",
    },
    currencySymbol: {
      type: DataTypes.STRING(10),
      defaultValue: "$",
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    smtpHost: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    smtpPort: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    smtpUser: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    smtpPassword: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    smtpSecure: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notificationsEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lowStockAlertsEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    invoicePrefix: {
      type: DataTypes.STRING(20),
      defaultValue: "INV",
    },
    orderPrefix: {
      type: DataTypes.STRING(20),
      defaultValue: "ORD",
    },
    paymentTermsDays: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
  },
  {
    tableName: "settings",
    timestamps: true,
  }
);

// Model methods
class SettingsModel {
  async get() {
    try {
      let settings = await Settings.findOne();
      
      // If no settings exist, create default
      if (!settings) {
        settings = await Settings.create({});
      }
      
      return settings;
    } catch (error) {
      throw new Error(`Error fetching settings: ${error.message}`);
    }
  }

  async update(data) {
    try {
      let settings = await Settings.findOne();
      
      if (!settings) {
        settings = await Settings.create(data);
      } else {
        await settings.update(data);
      }
      
      return settings;
    } catch (error) {
      throw new Error(`Error updating settings: ${error.message}`);
    }
  }

  async getTaxRate() {
    try {
      const settings = await this.get();
      return parseFloat(settings.taxRate) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getLowStockThreshold() {
    try {
      const settings = await this.get();
      return parseInt(settings.lowStockThreshold) || 10;
    } catch (error) {
      return 10;
    }
  }
}

module.exports = new SettingsModel();
module.exports.Settings = Settings;

