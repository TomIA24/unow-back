const mongoose = require("mongoose");
const Joi = require('joi');
const { questionSchema, validateQuestion } = require('./question');

const quizSchema = new mongoose.Schema({
    questions: [questionSchema],
    quizName: { type: String, required: true },
    score: { type: Number, required: true },
    incorrectlyAnsweredQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    flaggedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    courseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false }  // Changed to ObjectId
});

const Quiz = mongoose.model("Quiz", quizSchema);

const validateQuiz = (data) => {
    const schema = Joi.object({
        questions: Joi.array().items(validateQuestion).required().label("questions"),
        quizName: Joi.string().required().label("quizName"),
        score: Joi.number().required().label("score"),
        incorrectlyAnsweredQuestions: Joi.array().items(Joi.string()).label("incorrectlyAnsweredQuestions"),
        flaggedQuestions: Joi.array().items(Joi.string()).label("flaggedQuestions"),
        courseID: Joi.array().items(Joi.string()).label("courseID")
    });
    return schema.validate(data);
};

module.exports = { Quiz, validateQuiz };
