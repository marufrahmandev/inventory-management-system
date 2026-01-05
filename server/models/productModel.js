const { Product, Category } = require("./index");
const { Op } = require("sequelize");

/**
 * Product Model using Sequelize ORM
 * Provides clean interface for product operations with category associations
 */
class ProductModel {
  /**
   * Get all products with category information
   */
  async getAll() {
    try {
      const products = await Product.findAll({
        include: [{
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        }],
        order: [["createdAt", "DESC"]],
      });
      
      // Transform to include categoryName at root level
      return products.map(product => {
        const data = product.toJSON();
        return {
          ...data,
          categoryName: data.category ? data.category.name : "Unknown",
        };
      });
    } catch (error) {
      console.error("Error getting all products:", error);
      return [];
    }
  }

  /**
   * Get product by ID with category information
   */
  async getById(id) {
    try {
      const product = await Product.findByPk(id, {
        include: [{
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        }],
      });
      
      if (!product) {
        return { success: false, message: "Product not found" };
      }
      
      const data = product.toJSON();
      return {
        ...data,
        categoryName: data.category ? data.category.name : "Unknown",
      };
    } catch (error) {
      console.error("Error getting product by ID:", error);
      return { success: false, message: "Error reading product" };
    }
  }

  /**
   * Get products by category ID
   */
  async getByCategoryId(categoryId) {
    try {
      return await Product.findAll({
        where: { categoryId },
        order: [["name", "ASC"]],
      });
    } catch (error) {
      console.error("Error getting products by category:", error);
      return [];
    }
  }

  /**
   * Create new product
   */
  async create(productData) {
    try {
      return await Product.create(productData);
    } catch (error) {
      console.error("Error creating product:", error);
      return { success: false, message: "Error creating product", error: error.message };
    }
  }

  /**
   * Update product
   */
  async update(id, productData) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return { success: false, message: "Product not found" };
      }
      
      await product.update(productData);
      return product;
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, message: "Error updating product" };
    }
  }

  /**
   * Delete product
   */
  async delete(id) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return { success: false, message: "Product not found" };
      }
      
      const productData = product.toJSON();
      await product.destroy();
      
      return productData;
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, message: "Error deleting product" };
    }
  }

  /**
   * Update product stock
   */
  async updateStock(id, quantity) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return { success: false, message: "Product not found" };
      }
      
      const newStock = (product.stock || 0) + quantity;
      await product.update({ stock: newStock });
      
      return product;
    } catch (error) {
      console.error("Error updating stock:", error);
      return { success: false, message: "Error updating stock" };
    }
  }

  /**
   * Get low stock products
   */
  async getLowStock() {
    try {
      return await Product.findAll({
        where: {
          stock: {
            [Op.lte]: sequelize.col("minStock"),
          },
        },
        order: [["stock", "ASC"]],
      });
    } catch (error) {
      console.error("Error getting low stock products:", error);
      return [];
    }
  }

  /**
   * Search products
   */
  async search(searchTerm) {
    try {
      return await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { sku: { [Op.like]: `%${searchTerm}%` } },
            { barcode: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        include: [{
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        }],
      });
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }
}

module.exports = new ProductModel();
