const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const notificationSchema = new mongoose.Schema({
    user: { type: JSON, required: true },
    course: { type: JSON, required: true },
    date: { type: Array, required: false },
    time: { type: Date, required: false },
    duration: { type: String, required: false },
    message: { type: String, required: false },
    NotifType: { type: String, required: true },
    NotifDate: { type: Date, default: Date.now }

});



const Notification = mongoose.model("Notification", notificationSchema);



module.exports = { Notification };