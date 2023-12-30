const express = require('express');
const { isLoggedIn, isAuthorized } = require('../midllewares/user');
const {
    addProduct
    , getProducts,
    getSingleProduct,
    addReview,
    deleteReview,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const router = express.Router();


router.route('/products/all_products').get(getProducts);
router.route('/products/:productId').get(getSingleProduct);

// logged in user routes 
router.route('/products/review')
    .post(isLoggedIn, addReview)
    .delete(isLoggedIn, deleteReview);

// admin routes
router.route('/products/add_product').post(isLoggedIn, isAuthorized("admin"), addProduct);
router.route('/products/update_product/:productId').post(isLoggedIn, isAuthorized("admin"), updateProduct);
router.route('/products/delete_product/:productId').post(isLoggedIn, isAuthorized("admin"), deleteProduct);


module.exports = router;