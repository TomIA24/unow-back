const Quiz = require("../models/Quiz");
const CandidatAnswer = require("../models/CandidatAnswer");

const createQuiz = async (req, res) => {
  try {
    const existingQuiz = await Quiz.findOne({ title: req.body.title });

    if (existingQuiz) {
      return res.status(400).json({ message: "Quiz already exists" });
    }

    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicQuizzes = async (req, res) => {
  try {
    const publicQuizzes = await Quiz.find({ public: true }).populate(
      "questions"
    );
    res.status(200).json(publicQuizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateQuiz = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId).populate("questions");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    const { numberOfQuestions, questions } = quiz;

    if (questions.length < numberOfQuestions) {
      return res
        .status(400)
        .json({ message: "Not enough questions available." });
    }

    const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, numberOfQuestions);

    const candidatAnswer = new CandidatAnswer({
      candidat: req.user._id,
      quiz: quiz._id,
      time: 90,
      questions: selectedQuestions.map((question) => ({
        question: question._id,
        answers: null
      }))
    });
    await candidatAnswer.save();

    res.status(200).json({
      message: "Quiz generated successfully.",
      candidatAnswer
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while generating the quiz." });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getPublicQuizzes,
  generateQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz
};
