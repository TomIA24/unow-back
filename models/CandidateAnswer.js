const mongoose = require("mongoose");

const CandidateAnswerSchema = new mongoose.Schema(
  {
    candidat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidat",
      required: true
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    chosenChoice: [{ type: String, required: true }]
  },
  { timestamps: true }
);

const UserAnswer = mongoose.model("CandidateAnswer", CandidateAnswerSchema);

module.exports = UserAnswer;
