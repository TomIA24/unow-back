const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { object } = require("joi");
// const passwordComplexity = require("joi-password-complexity");

const evaluationSchema = new mongoose.Schema({
    trainer: { type: Object, required: true },
    course: { type: Object, required: true },
    student: { type: Object, required: true },
    Evaluation: { type: Object, required: true },
    Result: { type: String, required: false }
});



const Evaluation = mongoose.model("evaluation", evaluationSchema);

const validateEvaluation = (data) => {
    const schema = Joi.object({
        trainer: Joi.object().required().label("trainer"),
        course: Joi.object().required().label("course"),
        student: Joi.object().required().label("student"),
        Evaluation: Joi.object().required().label("Evaluation"),
        Result: Joi.string().label("Result"),
    });
    return schema.validate(data);
};

module.exports = { Evaluation, validateEvaluation };