const mongoose = require("mongoose");

const CandidatAnswerSchema = new mongoose.Schema(
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
    score: { type: Number || null, default: null },
    questions: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true
        },
        answers:
          [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Choice"
            }
          ] || null
      }
    ]
  },
  { timestamps: true }
);

const CandidatAnswer = mongoose.model("CandidatAnswer", CandidatAnswerSchema);

module.exports = CandidatAnswer;
