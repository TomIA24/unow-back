const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware");
const {
  addItemToCart,
  getCartItems,
  removeItemFromCart
} = require("../controllers/cartController");

router.post("/", authenticateToken, addItemToCart);
router.get("/", authenticateToken, getCartItems);
router.delete("/:id", authenticateToken, removeItemFromCart);

module.exports = router;
