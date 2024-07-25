const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { object } = require("joi");
// const passwordComplexity = require("joi-password-complexity");

const trainerNotifsSchema = new mongoose.Schema({
    trainer: { type: Object, required: true },
    course: { type: Object, required: true },
    courseCertif: { type: String, required: true },
    courseDate: { type: Array, required: true },
    nbInscrit: { type: Number, required: true },
    reponseFormateur: { type: String, required: false },
    prixFormateur: { type: String, required: false },
    StatusMandate: { type: String, required: true },
    comments: { type: Array, required: false },
});



const TrainerNotifs = mongoose.model("TrainerNotifs", trainerNotifsSchema);

const validateNotif = (data) => {
    const schema = Joi.object({
        trainer: Joi.object().required().label("trainer"),
        course: Joi.object().required().label("course"),
        courseCertif: Joi.string().required().label("courseCertif"),
        courseDate: Joi.array().required().label("courseDate"),
        nbInscrit: Joi.number().required().label("nbInscrit"),
        reponseFormateur: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("reponseFormateur"),
        prixFormateur: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("prixFormateur"),
        StatusMandate: Joi.string().required().label("StatusMandate"),
        comments: Joi.alternatives().try(Joi.array(), Joi.allow(null)).label("comments"),

    });
    return schema.validate(data);
};

module.exports = { TrainerNotifs, validateNotif };