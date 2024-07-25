const router = require("express").Router();
const { Candidat } = require("../models/Candidat");
const { Trainer } = require("../models/Trainer");
const { Admin } = require("../models/Admin");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const ObjectId = require('mongodb').ObjectID;
const { Sender, ContactAdmin } = require('./emailSender');
const passwordComplexity = require("joi-password-complexity");

var tokenVerifyEmailForResetPassword = null

function ValidateEmail(input) {
    console.log(input)
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (input.match(validRegex)) {

        console.log("Valid email address!");

        return true;

    } else {

        console.log("Invalid email address!");

        return false;

    }

}

function ValidateCode(input) {
    console.log(input)
    var validRegex = /^[0-9]+$/;

    if (input.match(validRegex)) {

        console.log("Valid code");

        return true;

    } else {

        console.log("Invalid code");

        return false;

    }

}

function authenticateToken(req, res, next) {


    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const decoded = jwt.decode(token)

    //console.log(req.headers)
    // console.log(token)
    //console.log(decoded)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.user = decoded
        next()
    })

}


const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};


router.post("/", async(req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await Candidat.findOne({ email: req.body.email });
        const trainer = await Trainer.findOne({ email: req.body.email });
        const admin = await Admin.findOne({ email: req.body.email });

        if (!user && !trainer && !admin)
            return res.status(401).send({ message: "Invalid Email" });

        var token = null
        if (user) {
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (!validPassword)
                return res.status(401).send({ message: "Invalid Password" });

            token = user.generateAuthToken();
            console.log(token)
        } else if (trainer) {
            const validPassword = await bcrypt.compare(
                req.body.password,
                trainer.password
            );
            if (!validPassword)
                return res.status(401).send({ message: "Invalid Password" });

            token = trainer.generateAuthToken();
        } else if (admin) {
            const validPassword = await bcrypt.compare(
                req.body.password,
                admin.password
            );
            if (!validPassword)
                return res.status(401).send({ message: "Invalid Password" });

            token = admin.generateAuthToken();
        }

        res.status(200).send({ data: token, message: "logged in successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)

    }
});




router.post("/VerifyEmailForPassword", async(req, res) => {

    try {

        const { error } = ValidateEmail(req.body.email);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await Candidat.findOne({ email: req.body.email });
        const trainer = await Trainer.findOne({ email: req.body.email });
        const admin = await Admin.findOne({ email: req.body.email });

        if (!user && !trainer && !admin)
            return res.status(401).send({ status: false, message: "No user found with this email" });


        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var token = getRandomInt(1000, 9999)
        tokenVerifyEmailForResetPassword = token.toString()
        if (user || trainer || admin) {
            Sender(req.body.email, token)
        }

        res.status(200).send({ status: true, message: "check your email address to reset your password" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)

    }

})

router.post("/VerifyCodeForPassword", async(req, res) => {

    try {

        const { error } = ValidateCode(req.body.code);
        if (error)
            return res.status(400).send({ message: error.details[0].message });


        if (req.body.code === "" || req.body.code === null || req.body.code !== tokenVerifyEmailForResetPassword)
            return res.status(401).send({ status: false, message: "Invalid Code" });


        if (req.body.code === tokenVerifyEmailForResetPassword) {
            res.status(200).send({ status: true, message: "code verified" });
        }

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)

    }

})

router.post("/ResetPassword", async(req, res) => {

    try {

        const validatePass = (password) => {
            const schema = Joi.object({

                password: passwordComplexity().required(),

            });
            return schema.validate(password);
        };

        const user = await Candidat.findOne({ email: req.body.email });
        const trainer = await Trainer.findOne({ email: req.body.email });
        const admin = await Admin.findOne({ email: req.body.email });

        if (user) {
            console.log(req.body.new)
            if (validatePass({ password: req.body.new })) {
                res.status(200).send({ status: true, message: "password Verified" });
                const salt = await bcrypt.genSalt(Number(process.env.SALT));
                const hashPassword = await bcrypt.hash(req.body.new, salt);
                console.log(hashPassword)
                await Candidat.updateOne({ email: req.body.email }, { $set: { password: hashPassword, name: "Oussama" } });
            }

        }

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)

    }

})


router.get("/showTrainers", authenticateToken, async(req, res) => {


    try {
        const id = req.user["_id"]
        const admin = await Admin.findOne({ _id: ObjectId(id) });
        if (admin) {
            const trainers = await Trainer.find();
            res.status(201).send({ trainers: trainers });
        }

        res.status(401).send({ message: "you are not allowed to access to this data" });

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
});


module.exports = router;