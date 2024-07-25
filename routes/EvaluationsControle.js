const router = require("express").Router();
require("dotenv").config();
const ObjectId = require('mongodb').ObjectID;
const { Trainer, validate } = require("../models/Trainer");
const { Candidat } = require("../models/Candidat");
const { Admin } = require("../models/Admin");
const { Evaluation, validateEvaluation } = require("../models/evaluation");
const { Room, validateRoom } = require("../models/Room");
const jwt = require("jsonwebtoken");

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

router.post("/setEvaluation", authenticateToken, async(req, res) => {
    const id = req.user["_id"]
    console.log(id)

    try {
        await Evaluation(req.body.Data).save()

        res.status(200).send({ message: "Evaluation saved" })

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
})

router.post("/getEvaluations", authenticateToken, async(req, res) => {
    const id = req.user["_id"]
    console.log(id)
    console.log(req.body)
    try {
        if (req.body.courseId !== "" && req.body.student !== "") {
            console.log(req.body.courseId, req.body.student)
            const evas = await Evaluation.find({ course: req.body.courseId, student: req.body.student })
            console.log(evas)
            res.status(200).send({ Evaluations: evas, message: "evaluations for Course" })
        }
        if (req.body.courseId !== "" && req.body.student === "") {
            const evas = await Evaluation.find({ course: req.body.courseId })
            console.log(evas)
            res.status(200).send({ Evaluations: evas, message: "evaluations for Course" })
        }
        if (req.body.courseId === "") {
            const evas = await Evaluation.find()
            console.log(evas)
            res.status(200).send({ Evaluations: evas, message: "all evaluations" })
        }

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
})






module.exports = router;