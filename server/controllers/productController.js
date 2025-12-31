const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");

class ProductController {
  async getAll(req, res) {
    try {
      const products = await productModel.getAll();
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({
        message: "Error fetching products",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getById(id);

      if (!product || !product.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({
        message: "Error fetching product",
        error: error.message,
      });
    }
  }

  async getByCategoryId(req, res) {
    try {
      const { categoryId } = req.params;
      const products = await productModel.getByCategoryId(categoryId);

      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return res.status(500).json({
        message: "Error fetching products by category",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const {
        name,
        categoryId,
        sku,
        description,
        price,
        cost,
        stock,
        minStock,
        unit,
        barcode,
      } = req.body;

      // Validate required fields
      if (!name || !categoryId) {
        return res.status(400).json({
          message: "Name and categoryId are required",
        });
      }

      // Verify category exists
      const category = await categoryModel.getById(categoryId);
      if (!category || !category.id) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const productData = {
        name,
        categoryId,
        sku: sku || "",
        description: description || "",
        price: parseFloat(price) || 0,
        cost: parseFloat(cost) || 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        unit: unit || "pcs",
        barcode: barcode || "",
      };

      const newProduct = await productModel.create(productData);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({
        message: "Error creating product",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        categoryId,
        sku,
        description,
        price,
        cost,
        stock,
        minStock,
        unit,
        barcode,
      } = req.body;

      // Verify category exists if provided
      if (categoryId) {
        const category = await categoryModel.getById(categoryId);
        if (!category || !category.id) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
      }

      const productData = {
        name,
        categoryId,
        sku,
        description,
        price: price ? parseFloat(price) : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        minStock: minStock !== undefined ? parseInt(minStock) : undefined,
        unit,
        barcode,
      };

      // Remove undefined values
      Object.keys(productData).forEach(
        (key) => productData[key] === undefined && delete productData[key]
      );

      const updatedProduct = await productModel.update(id, productData);

      if (!updatedProduct || !updatedProduct.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        message: "Error updating product",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedProduct = await productModel.delete(id);

      if (!deletedProduct || !deletedProduct.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(deletedProduct);
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({
        message: "Error deleting product",
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();

