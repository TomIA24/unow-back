require("dotenv").config();
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { Course } = require("../models/course");
const { Training } = require("../models/Training");
const { Candidat } = require("../models/Candidat");
const ObjectId = require('mongodb').ObjectID;



const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const decoded = jwt.decode(token)
        //console.log(req.body)
        // console.log(token)
        // console.log(decoded)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.user = decoded
        next()
    })
}



router.post("/course", authenticateToken, async(req, res) => {
    const id = req.user["_id"]
    console.log(req.user)
    try {
        var cours = {}
        const course = await Course.findOne({ _id: req.body.courseId })
        const training = await Training.findOne({ _id: req.body.courseId })
        if (course) {
            cours = course
        }
        if (training) {
            cours = training
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: cours.Title
                    },
                    unit_amount: parseInt((cours.Price / 3) * 100)
                },
                quantity: 1
            }],
            success_url: `${process.env.CLIENT}/successPayment/${req.body.courseId}`,
            cancel_url: `${process.env.CLIENT}/cancelPayment`,
        })

        res.json({ url: session.url })
    } catch (error) {

        res.status(500).send({ message: "Internal Server Error", error: error.message });
        console.log(error)

    }
});



router.post("/updatePayment", authenticateToken, async(req, res) => {

    const id = req.user["_id"]

    try {

        const course = await Course.findOne({ _id: req.body.courseId })
        const training = await Training.findOne({ _id: req.body.courseId })

        if (course) {
            await Course.updateOne({ _id: req.body.courseId }, { $push: { enrolled: id, enrolledPaid: id } })
            await Candidat.updateOne({ _id: ObjectId(id) }, { $push: { cartCourses: req.body.courseId } })
            await Candidat.updateOne({ _id: ObjectId(id) }, { $push: { CoursesPaid: req.body.courseId } })
        }

        if (training) {
            await Training.updateOne({ _id: req.body.courseId }, { $push: { enrolled: id, enrolledPaid: id } })
            await Candidat.updateOne({ _id: ObjectId(id) }, { $push: { cartTrainings: req.body.courseId } })
            await Candidat.updateOne({ _id: ObjectId(id) }, { $push: { TrainingsPaid: req.body.courseId } })
        }

        res.status(201).send({ message: "Course updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
});


module.exports = router;