const express = require('express');
const router = express.Router();
const { getPublicCompanyInfo, getProtectedCompanyInfo } = require('../controllers/companyController');
const { protect, isAuthorized } = require('../middleware/authMiddleware');

// Public route: requires a company ID
router.get('/public/:id', getPublicCompanyInfo);

// Protected route: uses token to identify company, only accessible by owner
router.get('/protected', protect, isAuthorized(), getProtectedCompanyInfo);

module.exports = router;
