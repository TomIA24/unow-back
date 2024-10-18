const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { Training } = require("../models/Training");
const { Course } = require("../models/course");
const { processPaidOrder } = require("../services/orderService");

const createOrder = async (req, res) => {
  const candidateId = req.user._id;
  const { itemId, itemType, phone, email, preferredContact } = req.body;

  try {
    const existingOrder = await Order.findOne({
      condidate: candidateId,
      item: itemId
    });

    if (existingOrder) {
      return res.status(400).send({ message: "Order already exists" });
    }

    const existingCartItem = await Cart.findOne({
      condidate: candidateId,
      item: itemId
    });

    if (!existingCartItem) {
      return res.status(400).send({ message: "Item not in cart" });
    }

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

    const newOrder = new Order({
      condidate: candidateId,
      item: itemId,
      phone,
      email,
      type: itemType,
      preferredContact,
      status: "pending"
    });
    await newOrder.save();
    await existingCartItem.updateOne({ $set: { status: "progress" } });

    if (parseInt(item.Price) === 0) {
      const paidOrderResponse = await processPaidOrder(
        candidateId,
        itemId,
        itemType,
        newOrder
      );
      return res.status(200).send(paidOrderResponse);
    }

    res
      .status(201)
      .send({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order: ", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

const getOrders = async (req, res) => {
  const candidateId = req.user._id;

  try {
    const orders = await Order.find({ condidate: candidateId }).exec();

    res.status(200).send({ orders });
  } catch (error) {
    console.error("Error retrieving orders: ", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "paid", "unpaid", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).send({ message: "Invalid status" });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    if (order.status === "paid") {
      processPaidOrder(order.condidate, order.item, order.type, order);
    }

    if (order.status !== "paid") {
      order.status = status;
      await order.save();
    }

    res
      .status(200)
      .send({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status: ", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus
};
