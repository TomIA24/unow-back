const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const FinancialAdministratorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    userType: { type: String, required: true }
});

FinancialAdministratorSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });
    return token;
};

const FinancialAdministrator = mongoose.model("admin", FinancialAdministratorSchema);

const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("Name"),
        phone: Joi.string().required().label("phone"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
        userType: Joi.string().required().label("usetType"),
    });
    return schema.validate(data);
};

module.exports = { FinancialAdministrator, validate };