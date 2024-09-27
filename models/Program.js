const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  title: { type: String, required: true },
  certifying: { type: Boolean, required: true },
  duration: { type: String, required: true },
  tj: { type: String, required: false },
});

const Program = mongoose.model("Program", programSchema);

module.exports = { Program };
