const express = require('express');
const { createOrder } = require('../controllers/orderController');

const router = express.Router();


router.route("/orders/place_order").post(createOrder);
module.exports = router;