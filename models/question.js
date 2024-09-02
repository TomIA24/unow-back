const mongoose = require("mongoose");
const Joi = require('joi');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    question: { type: String, required: true },
    correctAnswers: { type: [String], required: true },
    wrongAnswers: { type: [String], required: true },
    argument: { type: String, required: false },
    checked: { type: Boolean, default: false },
    flag:{type: Boolean, default: false }
});

const Question = mongoose.model("Question", questionSchema);

const validateQuestion = (data) => {
    const schema = Joi.object({
        question: Joi.string().required().label("Question"),
        correctAnswers: Joi.array().items(Joi.string()).required().label("CorrectAnswers"),
        wrongAnswers: Joi.array().items(Joi.string()).required().label("WrongAnswers"),
        argument: Joi.string().label("Argument"),
        checked: Joi.boolean().label("Checked"),
        flag: Joi.boolean().required().label("Flag")
    });
    return schema.validate(data);
};

module.exports = { Question, questionSchema, validateQuestion };

