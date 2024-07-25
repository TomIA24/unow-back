require("dotenv").config();
const router = require("express").Router();
const { Notification } = require("../models/Notification");
const jwt = require("jsonwebtoken");

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


router.post("/getNotifications", authenticateToken, async(req, res) => {
    const id = req.user["_id"]
    console.log(req.user)
    try {
        const notifications = await Notification.find()
        res.status(200).send({ data: notifications, message: "All Notifications" });
    } catch (error) {

        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)

    }
});


router.post("/saveNotifications", authenticateToken, async(req, res) => {

    try {
        await new Notification(req.body).save();
        console.log("saved")
        return res.status(201).send({ message: "Notification saved successfully" });
    } catch (err) {
        console.log(err)
    }
});

module.exports = router;