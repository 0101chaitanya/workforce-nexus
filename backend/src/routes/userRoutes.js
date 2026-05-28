const express = require("express");
const { protect, isAuthorized } = require("../middleware/authMiddleware");
const { validate, validateQuery } = require("../middleware/validationMiddleware");
const ownerSchemas = require("../schemas/ownerSchemas");
const userSchemas = require("../schemas/userSchemas");
const userController = require("../controllers/userController");

const router = express.Router();

router.use(protect); // All user routes are protected

// Only owner can add and search users
router.post("/add", isAuthorized(), validate(ownerSchemas.addUser), userController.addUser);
router.get("/search-users-or-get-all", isAuthorized(), validateQuery(ownerSchemas.searchUsersQuery), userController.searchUsers);

// Profile updates (User self-service)
router.put("/profile", validate(userSchemas.updateProfile), userController.updateProfile);

// Change password (Any user)
router.put("/change-password", validate(userSchemas.changePassword), userController.changePassword);

// Get user by ID (Owner can get any, employee can get themselves)
router.get("/info/:id", userController.getUserById);

// Owner updates specific user
router.put("/admin-update/:id", isAuthorized(), validate(userSchemas.updateUserByAdmin), userController.updateUserByAdmin);

// Owner deletes specific user
router.delete("/delete/:id", isAuthorized(), userController.deleteUser);

module.exports = router;
