const express = require('express');
const { isLoggedIn, isAuthorized } = require('../midllewares/user');

const { getCategories, addCategory } = require('../controllers/categoryController');
const router = express.Router();



router.route('/categories/add_category').post(isLoggedIn, isAuthorized("admin"), addCategory);
router.route('/categories/all_categories').get(getCategories);

module.exports = router;