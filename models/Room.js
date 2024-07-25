const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { object } = require("joi");
// const passwordComplexity = require("joi-password-complexity");

const roomSchema = new mongoose.Schema({
    trainer: { type: Object, required: true },
    courseId: { type: Object, required: true },
    course: { type: Object, required: true },
    urlId: { type: String, required: true },
});

const Room = mongoose.model("Room", roomSchema);

const validateRoom = (data) => {

    const schema = Joi.object({
        trainer: Joi.object().required().label("trainer"),
        course: Joi.object().required().label("course"),
        urlId: Joi.string().required().label("courseCertif"),
    });

    return schema.validate(data);

};

module.exports = { Room, validateRoom };