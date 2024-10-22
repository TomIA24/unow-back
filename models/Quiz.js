const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    numberOfQuestions: { type: Number },
    training: { type: mongoose.Schema.Types.ObjectId, ref: "Training" }
  },
  {
    timestamps: true
  }
);

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
