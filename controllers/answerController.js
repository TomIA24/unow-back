const Answer = require("../models/answer");

const createAnswer = async (req, res) => {
  try {
    const answer = new Answer(req.body);
    await answer.save();
    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAnswers = async (req, res) => {
  try {
    const answers = await Answer.find().populate("question");
    res.status(200).json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnswerById = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate("question");
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnswer = async (req, res) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    res.status(200).json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAnswer,
  getAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer
};
