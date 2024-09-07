const router = require("express").Router();
const { Trainer, validate } = require("../models/Trainer");
const { Candidat } = require("../models/Candidat");
const { Admin } = require("../models/Admin");
const { TrainerNotifs } = require("../models/TrainerNotifications");
const bcrypt = require("bcrypt");
const ObjectId = require('mongodb').ObjectID;
const jwt = require("jsonwebtoken");
const { Training } = require("../models/Training");

const { Room, validateRoom } = require("../models/Room");



function authenticateToken(req, res, next) {
    console.log(req.headers);
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const decoded = jwt.decode(token)
    //console.log(req.headers)
    // console.log(token)
    //console.log("decoded : ",decoded)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.user = decoded
        next()
    })

}



router.post("/", async (req, res) => {

    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const trainer = await Trainer.findOne({ email: req.body.email });
        const user = await Candidat.findOne({ email: req.body.email });

        if (trainer || user)
            return res
                .status(409)
                .send({ message: "Trainer with given email already Exist!" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        await new Trainer({ ...req.body, password: hashPassword }).save();
        res.status(201).send({ message: "Trainer created successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        //console.log("/////////", error)
    }

});

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const trainer = await Trainer.findOne({ email: req.body.email });
    const user = await Candidat.findOne({ email: req.body.email });

    if (trainer || user)
      return res
        .status(409)
        .send({ message: "Trainer with given email already Exist!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await new Trainer({ ...req.body, password: hashPassword }).save();
    res.status(201).send({ message: "Trainer created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    //console.log("/////////", error)
  }
});


router.post("/complete", authenticateToken, async (req, res) => {

    const id = req.user["_id"]
    console.log(req.body)
    try {
        // const { error } = validate(req.body);
        // if (error)
        //     return res.status(400).send({ message: error.details[0].message });
        await Trainer.updateOne({ _id: id }, { $set: req.body })

        res.status(201).send({ message: "Candidat updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
});



router.post("/GetNotifTrainerByCourse", authenticateToken, async (req, res) => {
    console.log("hello from server")
    const id = req.user["_id"]
    try {
        const trainerNotifs = await TrainerNotifs.find({ course: ObjectId(req.body.CourseId) })

        if (trainerNotifs) {
            console.log(trainerNotifs)
            res.status(200).send({ data: trainerNotifs, message: "All Notifications By Course" });
        }

        if (!trainerNotifs)
            return res.status(401).send({ message: "not found" });


    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)
    }
});

router.post("/ConfirmNotif", authenticateToken, async (req, res) => {
    //console.log("hello from server")
    const id = req.user["_id"]
    try {
        const trainerNotifs = await TrainerNotifs.find({ course: ObjectId(req.body.Course._id) })
        console.log(req.body)
        const data = { trainer: ObjectId(req.body.FRSelected.trainer), courseId: req.body.Course._id, course: req.body.Course, urlId: req.body.urlId }
        if (trainerNotifs) {
            validateRoom(data)
            await new Room(data).save();

            trainerNotifs.map(async notif => {
                if (req.body.FRSelected.Notif == notif._id) {
                    await TrainerNotifs.updateOne({ _id: ObjectId(notif._id) }, { StatusMandate: "confirmed" })
                    await Trainer.updateOne({ _id: ObjectId(req.body.FRSelected.trainer) }, { $push: { Trainings: req.body.Course._id } })
                }
                if (!(req.body.FRSelected.Notif == notif._id)) {
                    await TrainerNotifs.updateOne({ _id: ObjectId(notif._id) }, { StatusMandate: "closed" })
                }
            })
            await TrainerNotifs.find({ course: ObjectId(req.body.CourseId) }, {})
            await Training.updateOne({ _id: ObjectId(req.body.Course._id) }, { state: "confirmed", Trainer: ObjectId(req.body.FRSelected.trainer) })
        }


        res.status(200).send({ message: "confirmed" })


        if (!trainerNotifs)
            return res.status(401).send({ message: "not found" });


    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)
    }
});

router.get("/GetNotifTrainer", authenticateToken, async (req, res) => {
    //console.log("hello from server")
    const id = req.user["_id"]
    //console.log('///////',req.user)
    try {
        const trainerNotifs = await TrainerNotifs.find({ trainer: ObjectId(id) })

        if (!trainerNotifs)
            return res.status(401).send({ message: "not found" });

        if (trainerNotifs) {
            //console.log(trainerNotifs)
            res.status(200).send({ data: trainerNotifs, message: "All Notifications" });
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        //console.log(error)
    }
});

router.post("/UpdateNotifTrainer", authenticateToken, async (req, res) => {
    //console.log("hello from server")
    const id = req.user["_id"]
    //console.log('///////',req.body)
    try {

        if (req.body.data.reponseFormateur === "rejected") {
            await TrainerNotifs.updateOne({ _id: ObjectId(req.body.data.id) }, { $set: { reponseFormateur: req.body.data.reponseFormateur, StatusMandate: "rejected" } })
            res.status(200).send({ message: "rejected" })
        }

        if (!(req.body.data.reponseFormateur === "rejected")) {
            await TrainerNotifs.updateOne({ _id: ObjectId(req.body.data.id) }, { $set: { reponseFormateur: req.body.data.reponseFormateur, prixFormateur: req.body.data.prixFormateur } })
            res.status(200).send({ message: "Confirmed" })

        }




    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        //console.log(error)
    }
});


router.post("/UpdateCommentsNotifTrainer", authenticateToken, async (req, res) => {
    //console.log("hello from server")
    const id = req.user["_id"]
    //console.log('///////',req.body)
    try {

        await TrainerNotifs.updateOne({ _id: ObjectId(req.body.data.id) }, { $push: { comments: req.body.data.comments } })

        res.status(200).send({ message: "updated successfully" })

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        //console.log(error)
    }
});

router.post("/showTrainers", authenticateToken, async (req, res) => {


    try {
        const id = req.user["_id"]
        const admin = await Admin.findOne({ _id: ObjectId(id) });
        if (admin) {
            const trainers = await Trainer.find();
            //console.log(trainers)
            res.status(201).send({ trainers: trainers });
            //console.log(trainers)
        }
        //res.status(401).send({ message: "you are not allowed to access to this data" });

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
});

router.post("/deleteTrainers", authenticateToken, async (req, res) => {


    try {
        const id = req.user["_id"]
        const admin = await Admin.findOne({ _id: ObjectId(id) });
        if (admin) {
            //console.log(req)
            await Trainer.deleteOne({ _id: ObjectId(req.body.idTrainer) });
            res.status(201).send({ message: "user deleted successfully" });
            //console.log(users)
        }
        //res.status(401).send({ message: "you are not allowed to access to this data" });

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
});

router.post("/updateTrainers", authenticateToken, async (req, res) => {

    const id = req.user["_id"]
    console.log(req.body)
    try {
        // const { error } = validate(req.body);
        // if (error)
        //     return res.status(400).send({ message: error.details[0].message });
        await Trainer.updateOne({ _id: req.body._id }, { $set: req.body })

        res.status(201).send({ message: "Trainer updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
});


router.post("/getTrainer", authenticateToken, async (req, res) => {
    console.log("trainer")


    try {
        const id = req.user["_id"]
        const trainer = await Trainer.findOne({ _id: ObjectId(req.body.trainerId) });
        console.log(trainer)
        res.status(201).send({ trainer: trainer, message: "user deleted successfully" });


    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
});




router.post("/AllowTests", authenticateToken, async (req, res) => {
    const id = req.user["_id"]
    console.log(id)

    try {

        const tran = await Training.findOne({ _id: req.body.courseId })
        await Training.updateOne({ _id: req.body.courseId }, { testState: req.body.state })
        console.log(req.body.state)
        console.log(req.body.courseId)
        console.log(tran)

        res.status(200).send({ message: req.body.state })

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
})

router.get("/trainers", async (req, res) => {
    try {
        const trainers = await Trainer.find({}, 'name surname image description');
        console.log("trainers",trainers)
        res.status(200).send({ trainers: trainers });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
    }
});


module.exports = router;