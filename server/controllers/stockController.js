const stockModel = require("../models/stockModel");
const productModel = require("../models/productModel");

class StockController {
  async getAll(req, res) {
    try {
      const stocks = await stockModel.getAll();

      // Enrich stocks with product information
      const enrichedStocks = await Promise.all(
        stocks.map(async (stock) => {
          const product = await productModel.getById(stock.productId);
          return {
            ...stock,
            productName: product && product.id ? product.name : "Unknown",
            productSku: product && product.id ? product.sku : "",
          };
        })
      );

      return res.status(200).json({ success: true, data: enrichedStocks });
    } catch (error) {
      console.error("Error fetching stocks:", error);
      return res.status(500).json({
        message: "Error fetching stocks",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const stock = await stockModel.getById(id);

      if (!stock || !stock.id) {
        return res.status(404).json({ message: "Stock not found" });
      }

      // Add product information
      const product = await productModel.getById(stock.productId);
      stock.productName = product && product.id ? product.name : "Unknown";
      stock.productSku = product && product.id ? product.sku : "";

      return res.status(200).json(stock);
    } catch (error) {
      console.error("Error fetching stock:", error);
      return res.status(500).json({
        message: "Error fetching stock",
        error: error.message,
      });
    }
  }

  async getByProductId(req, res) {
    try {
      const { productId } = req.params;
      const stocks = await stockModel.getByProductId(productId);

      return res.status(200).json(stocks);
    } catch (error) {
      console.error("Error fetching stocks by product:", error);
      return res.status(500).json({
        message: "Error fetching stocks by product",
        error: error.message,
      });
    }
  }

  async getLowStock(req, res) {
    try {
      const { threshold } = req.query;
      const minThreshold = threshold ? parseInt(threshold) : 10;
      const lowStocks = await stockModel.getLowStockProducts(minThreshold);

      // Enrich with product information
      const enrichedStocks = await Promise.all(
        lowStocks.map(async (stock) => {
          const product = await productModel.getById(stock.productId);
          return {
            ...stock,
            productName: product && product.id ? product.name : "Unknown",
            productSku: product && product.id ? product.sku : "",
          };
        })
      );

      return res.status(200).json({ success: true, data: enrichedStocks });
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      return res.status(500).json({
        message: "Error fetching low stock products",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const {
        productId,
        quantity,
        location,
        warehouseSection,
        batchNumber,
        expiryDate,
        notes,
      } = req.body;

      // Validate required fields
      if (!productId || quantity === undefined) {
        return res.status(400).json({
          message: "Product ID and quantity are required",
        });
      }

      // Verify product exists
      const product = await productModel.getById(productId);
      if (!product || !product.id) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const stockData = {
        productId,
        quantity: parseInt(quantity),
        location: location || "",
        warehouseSection: warehouseSection || "",
        batchNumber: batchNumber || "",
        expiryDate: expiryDate || null,
        notes: notes || "",
      };

      const newStock = await stockModel.create(stockData);

      // Update product stock
      productModel.updateStock(productId, parseInt(quantity));

      return res.status(201).json(newStock);
    } catch (error) {
      console.error("Error creating stock:", error);
      return res.status(500).json({
        message: "Error creating stock",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const existingStock = await stockModel.getById(id);

      if (!existingStock || !existingStock.id) {
        return res.status(404).json({ message: "Stock not found" });
      }

      const {
        productId,
        quantity,
        location,
        warehouseSection,
        batchNumber,
        expiryDate,
        notes,
      } = req.body;

      // Verify product exists if provided
      if (productId) {
        const product = await productModel.getById(productId);
        if (!product || !product.id) {
          return res.status(400).json({ message: "Invalid product ID" });
        }
      }

      const stockData = {
        productId,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        location,
        warehouseSection,
        batchNumber,
        expiryDate,
        notes,
      };

      // Remove undefined values
      Object.keys(stockData).forEach(
        (key) => stockData[key] === undefined && delete stockData[key]
      );

      // Update product stock if quantity changed
      if (quantity !== undefined && quantity !== existingStock.quantity) {
        const difference = parseInt(quantity) - existingStock.quantity;
        productModel.updateStock(existingStock.productId, difference);
      }

      const updatedStock = await stockModel.update(id, stockData);
      return res.status(200).json(updatedStock);
    } catch (error) {
      console.error("Error updating stock:", error);
      return res.status(500).json({
        message: "Error updating stock",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const stock = await stockModel.getById(id);

      if (!stock || !stock.id) {
        return res.status(404).json({ message: "Stock not found" });
      }

      // Update product stock
      productModel.updateStock(stock.productId, -stock.quantity);

      const deletedStock = await stockModel.delete(id);
      return res.status(200).json(deletedStock);
    } catch (error) {
      console.error("Error deleting stock:", error);
      return res.status(500).json({
        message: "Error deleting stock",
        error: error.message,
      });
    }
  }
}

module.exports = new StockController();

