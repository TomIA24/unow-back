const mongoose = require("mongoose");
const Joi = require("joi");

const newsletterClientSchema = new mongoose.Schema({
    email: { type: String, required: true },
});



const NewsletterClient = mongoose.model("newsletterClient", newsletterClientSchema);

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("email"),
    });
    return schema.validate(data);
};

module.exports = { NewsletterClient, validate };