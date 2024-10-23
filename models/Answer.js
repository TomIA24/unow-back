const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    correctChoice: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Choice", required: true }
    ]
  },
  {
    timestamps: true
  }
);

const Answer = mongoose.model("Answer", AnswerSchema);

module.exports = Answer;
