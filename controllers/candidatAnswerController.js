const CandidatAnswer = require("../models/CandidatAnswer");

const createCandidatAnswer = async (req, res) => {
  try {
    const candidatAnswer = new CandidatAnswer(req.body);
    await candidatAnswer.save();
    res.status(201).json(candidatAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCandidatAnswers = async (req, res) => {
  try {
    const candidatAnswers = await CandidatAnswer.find().populate(
      "candidat quiz question"
    );
    res.status(200).json(candidatAnswers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCandidatAnswerById = async (req, res) => {
  try {
    const candidatAnswer = await CandidatAnswer.findById(
      req.params.id
    ).populate("candidat quiz question");
    if (!candidatAnswer)
      return res.status(404).json({ message: "Candidat answer not found" });
    res.status(200).json(candidatAnswer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCandidatAnswer = async (req, res) => {
  try {
    const candidatAnswer = await CandidatAnswer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!candidatAnswer)
      return res.status(404).json({ message: "Candidat answer not found" });
    res.status(200).json(candidatAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCandidatAnswer = async (req, res) => {
  try {
    const candidatAnswer = await CandidatAnswer.findByIdAndDelete(
      req.params.id
    );
    if (!candidatAnswer)
      return res.status(404).json({ message: "Candidat answer not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCandidatAnswer,
  getCandidatAnswers,
  getCandidatAnswerById,
  updateCandidatAnswer,
  deleteCandidatAnswer
};
