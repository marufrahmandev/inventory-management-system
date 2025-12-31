const { Stock, Product } = require("./index");
const { Op } = require("sequelize");

/**
 * Stock Model using Sequelize ORM
 * Provides clean interface for stock operations
 */
class StockModel {
  /**
   * Get all stocks with product information
   */
  async getAll() {
    try {
      const stocks = await Stock.findAll({
        include: [{
          model: Product,
          attributes: ["id", "name", "sku"],
        }],
        order: [["createdAt", "DESC"]],
      });
      
      return stocks.map(stock => {
        const data = stock.toJSON();
        return {
          ...data,
          productName: data.product ? data.product.name : "Unknown",
          productSku: data.product ? data.product.sku : "",
        };
      });
    } catch (error) {
      console.error("Error getting all stocks:", error);
      return [];
    }
  }

  /**
   * Get stock by ID with product information
   */
  async getById(id) {
    try {
      const stock = await Stock.findByPk(id, {
        include: [{
          model: Product,
          attributes: ["id", "name", "sku"],
        }],
      });
      
      if (!stock) {
        return { success: false, message: "Stock not found" };
      }
      
      const data = stock.toJSON();
      return {
        ...data,
        productName: data.product ? data.product.name : "Unknown",
        productSku: data.product ? data.product.sku : "",
      };
    } catch (error) {
      console.error("Error getting stock by ID:", error);
      return { success: false, message: "Error reading stock" };
    }
  }

  /**
   * Get stocks by product ID
   */
  async getByProductId(productId) {
    try {
      return await Stock.findAll({
        where: { productId },
        include: [{
          model: Product,
          attributes: ["id", "name", "sku"],
        }],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting stocks by product:", error);
      return [];
    }
  }

  /**
   * Create new stock
   */
  async create(stockData) {
    try {
      return await Stock.create(stockData);
    } catch (error) {
      console.error("Error creating stock:", error);
      return { success: false, message: "Error creating stock", error: error.message };
    }
  }

  /**
   * Update stock
   */
  async update(id, stockData) {
    try {
      const stock = await Stock.findByPk(id);
      
      if (!stock) {
        return { success: false, message: "Stock not found" };
      }
      
      await stock.update(stockData);
      return stock;
    } catch (error) {
      console.error("Error updating stock:", error);
      return { success: false, message: "Error updating stock" };
    }
  }

  /**
   * Delete stock
   */
  async delete(id) {
    try {
      const stock = await Stock.findByPk(id);
      
      if (!stock) {
        return { success: false, message: "Stock not found" };
      }
      
      const stockData = stock.toJSON();
      await stock.destroy();
      
      return stockData;
    } catch (error) {
      console.error("Error deleting stock:", error);
      return { success: false, message: "Error deleting stock" };
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold = 10) {
    try {
      const stocks = await Stock.findAll({
        where: {
          quantity: {
            [Op.lte]: threshold,
          },
        },
        include: [{
          model: Product,
          attributes: ["id", "name", "sku"],
        }],
        order: [["quantity", "ASC"]],
      });
      
      return stocks.map(stock => {
        const data = stock.toJSON();
        return {
          ...data,
          productName: data.product ? data.product.name : "Unknown",
          productSku: data.product ? data.product.sku : "",
        };
      });
    } catch (error) {
      console.error("Error getting low stock products:", error);
      return [];
    }
  }

  /**
   * Get stocks by location
   */
  async getByLocation(location) {
    try {
      return await Stock.findAll({
        where: { location },
        include: [{
          model: Product,
          attributes: ["id", "name", "sku"],
        }],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting stocks by location:", error);
      return [];
    }
  }

  /**
   * Get expiring stocks
   */
  async getExpiringStocks(days = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      return await Stock.findAll({
        where: {
          expiryDate: {
            [Op.between]: [new Date(), futureDate],
          },
        },
        include: [{
          model: Product,
          attributes: ["id", "name", "sku"],
        }],
        order: [["expiryDate", "ASC"]],
      });
    } catch (error) {
      console.error("Error getting expiring stocks:", error);
      return [];
    }
  }
}

module.exports = new StockModel();
