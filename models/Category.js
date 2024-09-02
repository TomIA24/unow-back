const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Trainings: { type: Array, required: false },
  Courses: { Type: Array, required: false },
});

const Category = mongoose.model("category", categorySchema);

const validateCategory = (data) => {
  const schema = Joi.object({
    Title: Joi.string().required().label("Title"),
    Trainings: Joi.array().label("Trainings").optional(),
    Courses: Joi.array().label("Courses").optional(),
  });
  return schema.validate(data);
};

module.exports = { Category, validateCategory };