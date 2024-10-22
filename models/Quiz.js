const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    numberOfQuestions: { type: Number, required: true },
    public: { type: Boolean, default: false },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    related: {
      type: String,
      required: true,
      enum: ["course", "training", "general"]
    },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    training: { type: mongoose.Schema.Types.ObjectId, ref: "Training" }
  },
  {
    timestamps: true
  }
);

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
