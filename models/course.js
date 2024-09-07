const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
// const passwordComplexity = require("joi-password-complexity");

const courseSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    //Trainer: { type: String, required: false }, 
    Description: { type: String, required: true },
    Goals: { type: String, required: true },
    WhoShouldAttend: { type: String, required: true },
    CourseContent: { type: String, required: true },
    PracticalWork: { type: String, required: true },
    Category: { type: String, required: true },
    Thumbnail: { type: Object, required: false }, 
    Videos: { type: Array, required: false },
    Price: { type: String, required: true },
    Level: { type: String, required: true },
    Reference: { type: String, required: true },
    enrolled: { type: Array, required: false },
    enrolledPaid: { type: Array, required: false },
    certificate: { type: String, required: true },
    evaluate: { type: Array, required: false },
    rating: { type: Number, required: false },
    QuestionsQCM: { type: Array, required: false },
    QuestionsQR: { type: Array, required: false },
    testState: { type: String, required: true },
    Ressources: { type: Array, required: false },
    //duration  //duration should be saved in the quiz and the quiz should be made at the same time as the quiz
    DurationQuiz: { type: Number, required: false },
    //nbreQuestion
    NumberQuestion: { type: Number, required: false },
    //nbreQuiz
    QuizNumber: { type: Number, required: false },
    //nmbresection 
    nbreSection: { type: Number, required: false },
    //video
    video: { type: Number, required: false },
    //pdf 
    pdf: { type: Number, required: false },
    //fi kull section quiz
    sectionqiuz: { type: Number, required: false },
    
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],

//tags
tags: { type: Number, required: false },

});



const Course = mongoose.model("Course", courseSchema);

const validate = (data) => {
    const schema = Joi.object({
        Title: Joi.string().required().label("Title"),
        Trainer: Joi.string().label("Trainer"),
        Description: Joi.string().required().label("Description"),
        Goals: Joi.string().required().label("Goals"),
        WhoShouldAttend: Joi.string().required().label("WhoShouldAttend"),
        CourseContent: Joi.string().required().label("courseContent"),
        PracticalWork: Joi.string().required().label("practicalWork"),
        Category: Joi.string().required().label("Category"),
        Thumbnail: Joi.alternatives().try(Joi.object(), Joi.allow(null)).label("thumbnail"),
        Videos: Joi.array().required().label("Videos"),
        DurationQuiz:Joi.number().label("DurationQuiz"),
        NumberQuestion:Joi.number().label("NumberQuestion"),
        QuizNumber: Joi.number().label("QuizNumber"),
        Price: Joi.string().required().label("Price"),
        Level: Joi.string().required().label("Level"),
        Reference: Joi.string().required().label("Reference"),
        enrolled: Joi.array().required().label("enrolled"),
        quizzes: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).label("quizzes")
        // Price: Joi.string().required().label("Price"),
        // Level: Joi.string().required().label("Level"),
    });
    return schema.validate(data);
};

module.exports = { Course, validate };