const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    condidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidat" },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Training" || "Course" },
    phone: { type: String },
    email: { type: String },
    type: {
      type: String,
      enum: ["training", "course"],
      required: true
    },
    preferredContact: {
      type: String,
      enum: ["email", "phone"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "unpaid", "cancelled"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

OrderSchema.path("phone").validate(function (value) {
  return value || this.email;
}, "Either phone or email must be provided.");

OrderSchema.path("email").validate(function (value) {
  return value || this.phone;
}, "Either phone or email must be provided.");

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
