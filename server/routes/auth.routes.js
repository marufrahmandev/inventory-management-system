const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth.middleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", verifyToken, authController.getProfile);
router.get("/verify", verifyToken, authController.verifyToken);

module.exports = router;

