const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true
    },
    questionText: { type: String },
    questionImage: { type: String },
    multipleChoices: { type: Boolean },
    choices: [ChoiceSchema]
  },
  {
    timestamps: true
  }
);

const ChoiceSchema = new mongoose.Schema(
  {
    text: { type: String },
    image: { type: String }
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

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
