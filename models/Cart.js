const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    condidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidat" },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Training" || "Course" },
    type: {
      type: String,
      enum: ["training", "course"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "progress"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
