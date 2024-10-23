const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const { uploadSingleFile } = require("../services/fileService");

const createQuestion = async (req, res) => {
  try {
    const questionData = {
      quiz: req.body.quiz,
      questionText: req.body.questionText,
      multipleChoices: req.body.multipleChoices === "true",
      choices: [],
      answersCount: req.body.answersCount
    };

    const existingQuestion = await Question.findOne({
      quiz: req.body.quiz,
      questionText: req.body.questionText
    });

    if (existingQuestion) {
      return res.status(400).json({ message: "Question already exists" });
    }

    if (req.files && req.files.length > 0) {
      const questionImageFile = await uploadSingleFile(req.files[0]);
      questionData.questionImage = questionImageFile;
    }

    const choices = req.body.choices || [];
    let choiceIndex = 1;
    for (let i = 0; i < choices.length; i++) {
      const choiceData = {
        text: choices[i].text
      };

      if (req.files && req.files[choiceIndex]) {
        const choiceImageFile = await uploadSingleFile(req.files[choiceIndex]);
        choiceData.image = choiceImageFile;
        choiceIndex++;
      }

      questionData.choices.push(choiceData);
    }

    const question = new Question(questionData);
    await question.save();

    await Quiz.findByIdAndUpdate(req.body.quiz, {
      $push: { questions: question._id }
    });

    const quiz = await Quiz.findById(req.body.quiz);
    if (quiz.questions.length >= quiz.numberOfQuestions) {
      quiz.public = true;
      await quiz.save();
    }

    res.status(201).json(question);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    console.log("entered");
    const questions = await Question.find();
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
