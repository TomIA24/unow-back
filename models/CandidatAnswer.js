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
    time: { type: Number, required: true },
    score: { type: Number, required: true },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true
        },
        answers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Choice",
            required: true
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

const UserAnswer = mongoose.model("CandidateAnswer", CandidateAnswerSchema);

module.exports = UserAnswer;
