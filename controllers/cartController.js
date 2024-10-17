const Cart = require("../models/Cart");
const { Training } = require("../models/Training");
const { Course } = require("../models/course");

const addItemToCart = async (req, res) => {
  const candidateId = req.user._id;
  const { itemId, itemType } = req.body;

  try {
    if (itemType !== "course" && itemType !== "training") {
      return res.status(400).send({ message: "Invalid item type" });
    }

    let item;
    if (itemType === "course") {
      item = await Course.findById(itemId);
    } else if (itemType === "training") {
      item = await Training.findById(itemId);
    }

    if (!item) {
      return res.status(404).send({ message: `${itemType} not found` });
    }

    const existingCartItem = await Cart.findOne({
      condidate: candidateId,
      item: itemId,
      type: itemType
    });

    if (existingCartItem) {
      return res.status(400).send({ message: "Item already in cart" });
    }

    const cartItem = new Cart({
      condidate: candidateId,
      item: itemId,
      type: itemType,
      status: "pending"
    });

    await cartItem.save();

    res
      .status(201)
      .send({ message: "Item added to cart successfully", cartItem });
  } catch (error) {
    console.error("Error adding item to cart: ", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

const getCartItems = async (req, res) => {
  const candidateId = req.user._id;

  try {
    const cartItems = await Cart.find({ condidate: candidateId })
      .populate({
        path: "item",
        select: "Title Description Level Price Thumbnail"
      })
      .exec();

    res.status(200).send({ cartItems });
  } catch (error) {
    console.error("Error retrieving cart items: ", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  const id = req.params.id;

  try {
    await Cart.findOneAndDelete({ _id: id });

    res.status(200).send({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Error removing item from cart: ", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { addItemToCart, getCartItems, removeItemFromCart };
