const categoryModel = require("../models/categoryModel");
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require("../utils/cloudinaryHelper");
const fs = require("fs");
const path = require("path");

class CategoryController {
  async getAll(req, res) {
    try {
      let categories = await categoryModel.getAll();

      if (categories.length > 0) {
        categories = categories.map((item) => ({
          ...item,
          category_image_url: item.category_image
            ? `http://localhost:3000/${item.category_image}`
            : null,
        }));
      }

      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({
        message: "Error fetching categories",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryModel.getById(id);

      if (!category || !category.id) {
        return res.status(404).json({ message: "Category not found" });
      }

      if (category.category_image) {
        category.category_image_url = `http://localhost:3000/uploads/${category.category_image}`;

        try {
          const filePath = path.join(__dirname, "..", "uploads", category.category_image);
          const imageMimeTypeMap = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            webp: "image/webp",
          };
          const imageMimeType = imageMimeTypeMap[category.category_image.split(".")[1]];
          const imageBuffer = fs.readFileSync(filePath);
          const base64Image = imageBuffer.toString("base64");
          category.category_image_base64 = `data:${imageMimeType};base64,${base64Image}`;
        } catch (error) {
          console.error("Error reading category image:", error);
        }
      }

      return res.status(200).json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      return res.status(500).json({
        message: "Error fetching category",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const { name = "", description = "", parent_category = null } = req.body;

      // Convert empty string to null for parent_category
      const parentCategoryValue = parent_category && parent_category.trim() !== "" ? parent_category : null;

      const categoryData = {
        name,
        description,
        parent_category: parentCategoryValue,
        category_image: req.file ? req.file.filename : null,
      };

      const newCategory = await categoryModel.create(categoryData);

      // Upload image to Cloudinary if file exists
      if (req.file && req.file.filename && newCategory?.id) {
        uploadImageToCloudinary(newCategory.id, req.file.filename, "categories", categoryModel);
      }

      return res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({
        message: "Error creating category",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name = "",
        description = "",
        parent_category = null,
        category_image = null,
      } = req.body;

      // Convert empty string to null for parent_category
      const parentCategoryValue = parent_category && parent_category.trim() !== "" ? parent_category : null;

      const categoryData = {
        name,
        description,
        parent_category: parentCategoryValue,
        category_image: req.file ? req.file.filename : category_image,
      };

      const updatedCategory = await categoryModel.update(id, categoryData);

      if (!updatedCategory || !updatedCategory.id) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Upload new image to Cloudinary if file exists
      if (req.file && req.file.filename) {
        uploadImageToCloudinary(id, req.file.filename, "categories", categoryModel);
      }

      return res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({
        message: "Error updating category",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryModel.getById(id);

      if (!category || !category.id) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Delete image from Cloudinary and local storage
      if (category.category_image) {
        if (category.publicId) {
          await deleteImageFromCloudinary(category.publicId);
        }

        // Delete local file
        try {
          const filePath = path.join(__dirname, "..", "uploads", category.category_image);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error("Error deleting local image:", error);
        }
      }

      const deletedCategory = await categoryModel.delete(id);
      return res.status(200).json(deletedCategory);
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({
        message: "Error deleting category",
        error: error.message,
      });
    }
  }
}

module.exports = new CategoryController();

