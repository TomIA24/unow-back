const mongoose = require('mongoose');
const { questionSchema } = require('./question'); // Reuse the existing question schema

const killMistakeSchema = new mongoose.Schema({
    questions: [questionSchema]
});

const KillMistake = mongoose.model("KillMistake", killMistakeSchema);

const validateKillMistake = (data) => {
    const schema = Joi.object({
        questions: Joi.array().items(validateQuestion).required().label("questions")
    });
    return schema.validate(data);
};

module.exports = { KillMistake, validateKillMistake };