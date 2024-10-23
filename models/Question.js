const mongoose = require("mongoose");

const ChoiceSchema = new mongoose.Schema(
  {
    text: { type: String },
    image: { type: Object }
  },
  {
    validate: {
      validator: function () {
        return this.text || this.image;
      },
      message: "Either text or image must be provided for the choice."
    }
  }
);

const QuestionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true
    },
    questionText: { type: String },
    questionImage: { type: Object },
    multipleChoices: { type: Boolean, required: true },
    answersCount: { type: Number, required: true },
    choices: [ChoiceSchema]
  },
  {
    timestamps: true
  }
);

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
