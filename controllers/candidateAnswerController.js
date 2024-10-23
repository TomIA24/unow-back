const CandidateAnswer = require("../models/CandidatAnswer");

const createCandidateAnswer = async (req, res) => {
  try {
    const candidateAnswer = new CandidateAnswer(req.body);
    await candidateAnswer.save();
    res.status(201).json(candidateAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCandidateAnswers = async (req, res) => {
  try {
    const candidateAnswers = await CandidateAnswer.find().populate(
      "candidat quiz question"
    );
    res.status(200).json(candidateAnswers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCandidateAnswerById = async (req, res) => {
  try {
    const candidateAnswer = await CandidateAnswer.findById(
      req.params.id
    ).populate("candidat quiz question");
    if (!candidateAnswer)
      return res.status(404).json({ message: "Candidate answer not found" });
    res.status(200).json(candidateAnswer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCandidateAnswer = async (req, res) => {
  try {
    const candidateAnswer = await CandidateAnswer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!candidateAnswer)
      return res.status(404).json({ message: "Candidate answer not found" });
    res.status(200).json(candidateAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCandidateAnswer = async (req, res) => {
  try {
    const candidateAnswer = await CandidateAnswer.findByIdAndDelete(
      req.params.id
    );
    if (!candidateAnswer)
      return res.status(404).json({ message: "Candidate answer not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCandidateAnswer,
  getCandidateAnswers,
  getCandidateAnswerById,
  updateCandidateAnswer,
  deleteCandidateAnswer
};
