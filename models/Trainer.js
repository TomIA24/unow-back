const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const trainerSchema = new mongoose.Schema({
	name: { type: String, required: false },
	surname: {type: String, required: false },
	adresse: {type: String, required:false},
	phone: {type: String , required:false},
	email: { type: String, required: false },
	password: { type: String, required: false },
	connectingMetropolis: {type:String, required:false},
	monthlyBandwidth: {type: String, required:false},
	animationLanguage: {type:Array, required:false},
	description: {type: String, required:false},
	programs: {type: Array, required:false},
	dateOfCreation: {type:Date, required:false},
	chargeTVA: {type:Boolean, required:false},
	RCS: {type:String, required:false},
	SIRET: {type: String, required:false},
	socialReason: {type: String, required:false},
	image: {type: Object, required:false},
	userType: {type:String, required: true},
	firstConnection: {type:Boolean, required:true},
	Trainings:{type: Array, required:false},

	

});

trainerSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "7d",
	});
	return token;
};

const Trainer = mongoose.model("trainer", trainerSchema);

const validate = (data) => {

	const schema = Joi.object({
		name: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("Name"),
		surname: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("surname"),
		adresse: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("adresse"),
		phone: Joi.alternatives().try(Joi.string().length(10).pattern(/^[0-9]+$/), Joi.allow(null)).label("phone"),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
		connectingMetropolis: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("connectingMetropolis"),
		monthlyBandwidth: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("monthlyBandwidth"),
		animationLanguage: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("animationLanguage"),
		description: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("description"),
		programs: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("programs"),
		dateOfCreation: Joi.date().label("dateOfCreation"),
		chargeTVA: Joi.boolean().required().label("chargeTVA"),
		RCS: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("RCS"),
		SIRET: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("SIRET"),
		socialReason: Joi.alternatives().try(Joi.string(), Joi.allow(null)).label("socialReason"),
        image: Joi.alternatives().try(Joi.object(), Joi.allow(null)).label("image"),
		userType: Joi.string().required().label("usetType"),
		firstConnection: Joi.boolean().required().label("firstConnection"),

	});
	
	return schema.validate(data);
};

module.exports = { Trainer, validate };
