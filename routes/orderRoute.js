const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware");
const {
  createOrder,
  getOrders,
  updateOrderStatus
} = require("../controllers/orderController");

router.post("", authenticateToken, createOrder);
router.get("", authenticateToken, getOrders);
router.patch("/:orderId", authenticateToken, updateOrderStatus);

module.exports = router;
