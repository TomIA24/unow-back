const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const candidatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  userType: { type: String, required: true },
  password: { type: String, required: true },
  lastSeen: { type: Array, required: false },
  cartTrainings: { type: Array, required: false },
  TrainingsPaid: { type: Array, required: false },
  cartCourses: { type: Array, required: false },
  CoursesPaid: { type: Array, required: false },
  image: { type: Object, required: false },
  dateOfCreation: { type: Date, required: false },
  personalized: { type: Object, required: false },
  domain: { type: Array, required: false },
  otherDomain: { type: String, required: false },
  preferences: { type: Array, required: false },
  otherPreferences: { type: String, required: false },
  goals: { type: Array, required: false },
  otherGoals: { type: String, required: false },
  level: { type: Array, required: false },
  profilecomplited: { type: Number, required: false },
  stepPersonalize_1: {
    interests: {
      type: [String],
      required: false,
default: ['']

    },
    exploreFirst: {
      type: String,
      required: false,
      
    }
  },
  stepPersonalize_2: {
    goals: {
      type: [String],
      required: false,
      

    },
    timeline: {
      type: String,
      required: false,
      default: ''
    }
  },
  stepPersonalize_3: {
    availability: {
      type: [String],
      required: false,
     

    },
    hoursperweek: {
      type: String,
      required: false,
      default: ''
    },
    learningother: {
      type: String,
      required: false,
      default: ''
    }
  },
  stepPersonalize_4: {
    learningpace: {
      type: [String],
      required: false,
     

    },
    dayslearning: {
      type: String,
      required: false,
      default: ''
    }
    ,
    timeOfDay: {
      type: String,
      required: false,
      default: ''
    }
  },
});

candidatSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

const Candidat = mongoose.model("candidat", candidatSchema);

const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().optional().label("Name"),
    userName: Joi.string().optional().label("User Name"),
    phone: Joi.string().optional().label("phone"),
    email: Joi.string().email().optional().label("Email"),
    password: passwordComplexity().optional().label("Password"),
    userType: Joi.string().optional().label("usetType"),
    lastSeen: Joi.alternatives()
      .try(Joi.array(), Joi.allow(null))
      .label("lastSeen"),
    image: Joi.alternatives().try(Joi.object(), Joi.allow(null)).label("image"),
    dateOfCreation: Joi.date().label("dateOfCreation"),
    personalized: Joi.object().label("personalized"),

    domain: Joi.array().label("domain"),
    otherDomain: Joi.any().label("otherDomain"),
    preferences: Joi.array().label("preferences"),
    otherPreferences: Joi.any().label("otherPreferences"),
    goals: Joi.array().label("goals"),
    otherGoals: Joi.any().label("otherGoals"),
    level: Joi.array().label("level"),

   

    // style: Joi.array().items(Joi.string()).max(3).label("style"),
 

    profilecomplited: Joi.number().allow('').label("profilecomplited"),
    stepPersonalize_1: Joi.object({
      interests: Joi.array().items(Joi.string()).max(3).label("interests"),
      exploreFirst: Joi.string().allow('').label("exploreFirst")
    }).optional().label("stepPersonalize_1"),
    stepPersonalize_2: Joi.object({
      goals:Joi.array().items(Joi.string()).max(3).label("step2_goals"),
      timeline:Joi.string().allow('').label("timeline"),
    }).optional().label("stepPersonalize_2"),
    stepPersonalize_3: Joi.object({
      availability: Joi.array().items(Joi.string()).max(3).label("availability"),
        hoursperweek: Joi.string().allow('').label("hoursperweek"),
           learningother: Joi.string().allow('').label("learningother"),
    }).optional().label("stepPersonalize_3"),
    stepPersonalize_4: Joi.object({
          learningpace: Joi.array().items(Joi.string()).max(3).label("learningpace"),
    dayslearning: Joi.string().allow('').label("dayslearning"),
    timeOfDay: Joi.string().allow('').label("timeOfDay"),
    }).optional().label("stepPersonalize_4"),
  });
  return schema.validate(data);
};
//we need the field to be specific to check if the have been filled comlitly

module.exports = { Candidat, validate };