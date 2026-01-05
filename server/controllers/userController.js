const userModel = require("../models/userModel");

class UserController {
  async getAll(req, res) {
    try {
      const users = await userModel.getAll();
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching users",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.getById(id);

      if (!user || !user.id) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching user",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const { username, email, password, firstName, lastName, phone, role, status } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email, and password are required",
        });
      }

      // Check if user already exists
      const existingUserByEmail = await userModel.getByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      const existingUserByUsername = await userModel.getByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }

      const userData = {
        username,
        email,
        password,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        role: role || "staff",
        status: status || "active",
      };

      const user = await userModel.create(userData);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const existingUser = await userModel.getById(id);

      if (!existingUser || !existingUser.id) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Don't allow updating password through this endpoint
      const { password, ...updateData } = req.body;

      const updatedUser = await userModel.update(id, updateData);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating user",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      // Don't allow deleting yourself
      if (req.user && req.user.id === id) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete your own account",
        });
      }

      const existingUser = await userModel.getById(id);

      if (!existingUser || !existingUser.id) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await userModel.delete(id);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting user",
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();

