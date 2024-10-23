const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    numberOfQuestions: { type: Number, required: true },
    public: { type: Boolean, default: false },
    time: { type: Number, required: true },
    passingScore: { type: Number, required: true },
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

QuizSchema.pre("validate", function (next) {
  if (this.related === "course" && !this.course) {
    return next(
      new Error("Course ID is required when related is set to 'course'.")
    );
  }

  if (this.related === "training" && !this.training) {
    return next(
      new Error("Training ID is required when related is set to 'training'.")
    );
  }

  if (this.related === "general" && (this.course || this.training)) {
    return next(
      new Error(
        "Course and Training IDs must be empty when related is set to 'general'."
      )
    );
  }

  next();
});

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
