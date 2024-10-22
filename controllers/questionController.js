const Question = require("../models/Question");
const { uploadSingleFile } = require("../services/fileService");

const createQuestion = async (req, res) => {
  try {
    const questionData = {
      quiz: req.body.quiz,
      questionText: req.body.questionText,
      multipleChoices: req.body.multipleChoices,
      choices: []
    };

    if (req.file) {
      const questionImageFile = await uploadSingleFile(req, res);
      questionData.questionImage = questionImageFile;
    }

    const choices = req.body.choices || [];
    for (const choice of choices) {
      const choiceData = {
        text: choice.text
      };

      if (choice.image) {
        const choiceImage = await uploadSingleFile(choice.image);
        choiceData.image = choiceImage;
      }

      questionData.choices.push(choiceData);
    }

    const question = new Question(questionData);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate("quiz");
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("quiz");
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
};
