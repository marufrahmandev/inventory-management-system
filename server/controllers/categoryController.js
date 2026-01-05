const categoryModel = require("../models/categoryModel");
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require("../utils/cloudinaryHelper");

class CategoryController {
  async getAll(req, res) {
    try {
      let categories = await categoryModel.getAll();

      if (categories.length > 0) {
        categories = categories.map((item) => ({
          ...item,
          category_image_url: item.secureUrl || item.optimizedImageUrl || null,
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

      // Use Cloudinary URL instead of local path
      if (category.secureUrl || category.optimizedImageUrl) {
        category.category_image_url = category.secureUrl || category.optimizedImageUrl;
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
        await uploadImageToCloudinary(newCategory.id, req.file.filename, "categories", categoryModel);
      }

      // Fetch updated category with Cloudinary URLs
      const updatedCategory = await categoryModel.getById(newCategory.id);
      
      // Add category_image_url for consistency
      if (updatedCategory.secureUrl || updatedCategory.optimizedImageUrl) {
        updatedCategory.category_image_url = updatedCategory.secureUrl || updatedCategory.optimizedImageUrl;
      }

      return res.status(201).json(updatedCategory);
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
        await uploadImageToCloudinary(id, req.file.filename, "categories", categoryModel);
      }

      // Fetch updated category with Cloudinary URLs
      const finalCategory = await categoryModel.getById(id);
      
      // Add category_image_url for consistency
      if (finalCategory.secureUrl || finalCategory.optimizedImageUrl) {
        finalCategory.category_image_url = finalCategory.secureUrl || finalCategory.optimizedImageUrl;
      }

      return res.status(200).json(finalCategory);
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

      // Delete image from Cloudinary
      if (category.publicId) {
        await deleteImageFromCloudinary(category.publicId);
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

