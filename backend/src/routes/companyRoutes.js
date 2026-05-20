const express = require('express');
const router = express.Router();
const { getPublicCompanyInfo, getProtectedCompanyInfo, updateCompanyInfo } = require('../controllers/companyController');
const { protect, isAuthorized } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const ownerSchemas = require('../schemas/ownerSchemas');

// Public route: requires a company ID
router.get('/public/:id', getPublicCompanyInfo);

// Protected route: uses token to identify company, only accessible by owner
router.get('/protected', protect, isAuthorized(), getProtectedCompanyInfo);

// Update company info - only accessible by owner
router.put('/update', protect, isAuthorized(), validate(ownerSchemas.updateCompany), updateCompanyInfo);

module.exports = router;
