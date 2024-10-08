const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  title: { type: String, required: true },
  certifying: { type: Boolean, required: true },
  duration: { type: String, required: true },
  tj: { type: String, required: false },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
});

const Program = mongoose.model("Program", programSchema);

module.exports = { Program };
