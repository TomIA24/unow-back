const router = require("express").Router();
require("dotenv").config();
const ObjectId = require('mongodb').ObjectID;
const { Trainer, validate } = require("../models/Trainer");
const { Candidat } = require("../models/Candidat");
const { Admin } = require("../models/Admin");
const { Room, validateRoom } = require("../models/Room");
const jwt = require("jsonwebtoken");


function authenticateToken(req, res, next) {

    console.log(req.headers)
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

router.post("/getRooms", authenticateToken, async(req, res) => {
    try {
        const id = req.user["_id"]
        const rooms = await Room.find({ trainer: ObjectId(id) })
        console.log("hello" + rooms)
        if (rooms) {
            res.status(201).send({ data: rooms, message: "rooms found" })
        }

        if (!rooms) {
            res.status(404).send({ data: null, message: "rooms not found" })
        }


    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
})


router.post("/getRoom", authenticateToken, async(req, res) => {
    const id = req.user["_id"]
    console.log(id)

    try {
        const room = await Room.find({ courseId: req.body.course })
        console.log("room: ", room)
        if (room) {
            res.status(201).send({ data: room, message: "rooms found" })
        }

        if (!room) {
            res.status(404).send({ data: null, message: "rooms not found" })
        }


    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
})





module.exports = router;