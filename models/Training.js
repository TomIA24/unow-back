const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
// const passwordComplexity = require("joi-password-complexity");

const trainingSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: false
  },
  Description: { type: String, required: true },
  Duration: { type: String, required: true },
  Goals: { type: String, required: true },
  WhoShouldAttend: { type: String, required: true },
  CourseContent: { type: String, required: true },
  PracticalWork: { type: String, required: true },
  Category: { type: String, required: true },
  Thumbnail: { type: Object, required: false }, //
  Ressources: { type: Array, required: false },
  Price: { type: String, required: true },
  Level: { type: String, required: true },
  Date: { type: Array, required: true },
  TimePerDay: { type: Object, required: true },
  Reference: { type: String, required: true },
  enrolled: { type: Array, required: false, unique: false },
  enrolledPaid: { type: Array, required: false },
  QuestionsQCM: { type: Array, required: false },
  QuestionsQR: { type: Array, required: false },
  state: { type: String, required: true },
  certificate: { type: String, required: true },
  evaluate: { type: Array, required: false },
  rating: { type: Number, required: false },
  testState: { type: String, default: "closed" }
});

const Training = mongoose.model("Training", trainingSchema);

const validate = (data) => {
  const schema = Joi.object({
    Title: Joi.string().required().label("Title"),
    Trainer: Joi.string().label("Trainer"),
    Description: Joi.string().required().label("Description"),
    Goals: Joi.string().required().label("Goals"),
    WhoShouldAttend: Joi.string().required().label("WhoShouldAttend"),
    CourseContent: Joi.string().required().label("CourseContent"),
    PracticalWork: Joi.string().required().label("practicalWork"),
    Category: Joi.string().required().label("Category"),
    Thumbnail: Joi.alternatives()
      .try(Joi.object(), Joi.allow(null))
      .label("thumbnail")
    //Video: Joi.string().label("video"),

    // Price: Joi.string().required().label("Price"),
    // Level: Joi.string().required().label("Level"),
  });
  return schema.validate(data);
};

module.exports = { Training, validate };
