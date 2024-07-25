const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { object } = require("joi");
// const passwordComplexity = require("joi-password-complexity");

const categorySchema = new mongoose.Schema({
    Title: { type: String, required: true },
    Type: { type: Array, required: false },
    Trainings: { type: Array, required: false },
    Courses: { Type: Array, required: false },
});



const Category = mongoose.model("category", categorySchema);

const validateCategory = (data) => {
    const schema = Joi.object({
        Title: Joi.string().required().label("Title"),
        Type: Joi.array().label("Type"),
        Trainings: Joi.array().label("Trainings"),
        Courses: Joi.array().label("Courses"),

    });
    return schema.validate(data);
};

module.exports = { Category, validateCategory };