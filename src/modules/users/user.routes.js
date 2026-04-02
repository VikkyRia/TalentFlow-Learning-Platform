const express = require("express");
const router = express.Router();
const UserController = require("./user.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { allowRoles } = require("../../middlewares/role.middleware");

// GET /api/users/profile - Get my own profile
router.get("/profile", protect, UserController.getProfile);

// PATCH /api/users/profile - Update my own profile
router.patch("/profile", protect, UserController.updateProfile);

// GET /api/users - Get all users (admin only)
router.get("/", protect, allowRoles("admin"), UserController.getAllUsers);

// GET /api/users/:id - Get single user (admin only)
router.get("/:id", protect, allowRoles("admin"), UserController.getUserById);

// PATCH /api/users/:id/role - Assign role to user (admin only)
router.patch("/:id/role", protect, allowRoles("admin"), UserController.updateRole);

// GET /api/users/:id/progress - Get user learning history
router.get("/:id/progress", protect, UserController.getLearningHistory);

module.exports = router;