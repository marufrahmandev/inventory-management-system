const { Category } = require("./index");
const { Op } = require("sequelize");

/**
 * Category Model using Sequelize ORM
 * Provides clean interface for category operations
 */
class CategoryModel {
  /**
   * Get all categories
   */
  async getAll() {
    try {
      const categories = await Category.findAll({
        order: [["createdAt", "DESC"]],
        raw: true, // Return plain objects instead of Sequelize instances
      });
      return categories;
    } catch (error) {
      console.error("Error getting all categories:", error);
      return [];
    }
  }

  /**
   * Get category by ID
   */
  async getById(id) {
    try {
      const category = await Category.findByPk(id, {
        raw: true, // Return plain object instead of Sequelize instance
      });
      
      if (!category) {
        return { success: false, message: "Category not found" };
      }
      
      return category;
    } catch (error) {
      console.error("Error getting category by ID:", error);
      return { success: false, message: "Error reading category" };
    }
  }

  /**
   * Create new category
   */
  async create(categoryData) {
    try {
      return await Category.create(categoryData);
    } catch (error) {
      console.error("Error creating category:", error);
      return { success: false, message: "Error creating category", error: error.message };
    }
  }

  /**
   * Update category
   */
  async update(id, categoryData) {
    try {
      const category = await Category.findByPk(id);
      
      if (!category) {
        return { success: false, message: "Category not found" };
      }
      
      await category.update(categoryData);
      return category;
    } catch (error) {
      console.error("Error updating category:", error);
      return { success: false, message: "Error updating category" };
    }
  }

  /**
   * Delete category
   */
  async delete(id) {
    try {
      const category = await Category.findByPk(id);
      
      if (!category) {
        return { success: false, message: "Category not found" };
      }
      
      const categoryData = category.toJSON();
      await category.destroy();
      
      return categoryData;
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, message: "Error deleting category" };
    }
  }

  /**
   * Search categories by name
   */
  async search(searchTerm) {
    try {
      return await Category.findAll({
        where: {
          name: {
            [Op.like]: `%${searchTerm}%`,
          },
        },
      });
    } catch (error) {
      console.error("Error searching categories:", error);
      return [];
    }
  }
}

module.exports = new CategoryModel();
