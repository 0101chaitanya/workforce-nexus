const express = require("express");
const { protect, isAuthorized } = require("../middleware/authMiddleware");
const { validate, validateQuery } = require("../middleware/validationMiddleware");
const ownerSchemas = require("../schemas/ownerSchemas");
const userController = require("../controllers/userController");

const router = express.Router();

router.use(protect); // All user routes are protected

// Only owner can add and search users
router.post("/add", isAuthorized(), validate(ownerSchemas.addUser), userController.addUser);
router.get("/directory", isAuthorized(), validateQuery(ownerSchemas.searchUsersQuery), userController.searchUsers);
router.get("/all", isAuthorized(), userController.getAllCompanyUsers);

module.exports = router;