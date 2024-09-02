require("dotenv").config();
const router = require("express").Router();
const { Training } = require("../models/Training");
const { Trainer } = require("../models/Trainer");
const { Candidat } = require("../models/Candidat");
const jwt = require("jsonwebtoken");
const ObjectId = require('mongodb').ObjectID;
const { Admin } = require("../models/Admin");
const { Room, validateRoom } = require("../models/Room");
const { TrainerNotifs } = require("../models/TrainerNotifications");
const { Category } = require("../models/Category");
const { route } = require("./QuizControle");

function authenticateToken(req, res, next) {


  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  const decoded = jwt.decode(token)

  //console.log(req.headers)
  //console.log(token)
  //console.log(decoded)
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403)
    req.user = decoded
    next()
  })

}

const checkTrainings = async () => {
  try {
    const TodayDate = new Date();
    console.log(TodayDate.getTime());
    const trainings = await Training.find();
    trainings.map(async (training) => {
      console.log("training date : ", training.Date);
      console.log("today date : ", TodayDate);
      const trainDate = new Date(training.Date[0]).getTime();
      if (trainDate < TodayDate) {
        await Training.updateOne(
          { _id: training._id },
          { $set: { state: "expired" } }
        );
        await TrainerNotifs.updateOne(
          { course: training._id },
          { $set: { StatusMandate: "expired" } }
        );
      } else {
        console.log(training._id);
        console.log("Still available");
      }
    });
    console.log(trainings.length);
  } catch (err) {
    console.log(err);
  }
};
// setInterval(() => {
//   checkTrainings();
// }, 100000);

/**************API*************** */

router.get("/", async (req, res) => {
  try {
    const trainings = await Training.find();
    res.status(200).send({ data: trainings, message: "All trainings" });
  } catch (error) {
    //console.log(error)
    res.status(500).send({ message: "Internal Server Error", error: error });
    //console.log(error)
  }
});

router.post("/CreateTraining", async (req, res) => {
  //const token = req.body.headers.Authorization.substr(7, )
  //const id = jwt.decode(token)["_id"]
  //const idUser = req.user["_id"]
  try {
    // const { error } = validate(req.body);
    // if (error) {
    //     res.status(400).send({ message: error.details[0].message });
    //     console.log("400 error: ", error)
    // }

    if (await Training.findOne({ Title: req.body.Title })) {
      return res
        .status(409)
        .send({ message: "Training with given Title already Exist!" });
    }

    console.log("request -------------------- : ");
    console.log(req.body);
    console.log("request -------------------- : ");

    // const savedTraining = await new Training(req.body).save();
    const savedTraining = await Training.create({
      ...req.body,
    });

    console.log("saved:", savedTraining);
    console.log("saved: ", savedTraining._id);

    await Category.updateOne(
      { Title: req.body.Category },
      { $push: { Trainings: savedTraining._id } }
    );

    return res.status(201).send({
      message: "Training created successfully",
      id: savedTraining._id,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: err });
  }
});

router.get("/specific", async (req, res) => {
  try {
    const id = req.query.id;
    console.log("query : ", res.query);
    //console.log(req.query.id)
    const training = await Training.findById(ObjectId(id));

    //console.log(training)
    res.status(200).send({ data: training, message: "One training" });
  } catch (error) {
    //console.log(error)
    res.status(500).send({ message: "Internal Server Error", error: error });
    //console.log(error)
  }
});

//
router.post("/specificGroupe", authenticateToken, async (req, res) => {
  try {
    const training = await Training.find({ _id: { $in: req.body.cartIds } });
    res.status(200).send({ data: training, message: "All Training" });
  } catch (error) {
    //console.log(error)
    res.status(500).send({ message: "Internal Server Error", error: error });
    //console.log(error)
  }
});

router.post("/specificGroupeFromCategory", async (req, res) => {
  try {
    console.log("test trains");
    console.log("here: ", req.body);
    if (Array.isArray(req.body)) {
      const training = await Training.find({ _id: { $in: req.body } });
      return res.status(200).send({ data: training, message: "All Training" });
    }
    const training = await Training.find();
    res.status(200).send({ data: training, message: "All Training" });
  } catch (error) {
    //console.log(error)
    res.status(500).send({ message: "Internal Server Error", error: error });
    //console.log(error)
  }
});

router.post("/deleteTraining", authenticateToken, async (req, res) => {
  try {
    const id = req.user["_id"];
    console.log(req.body.idTraining);
    const admin = await Admin.findOne({ _id: ObjectId(id) });
    //console.log(admin)
    const training = await Training.findOne({
      _id: ObjectId(req.body.idTraining),
    });

    if (admin && training) {
      await Room.deleteOne({ courseId: ObjectId(training._id) });
      await TrainerNotifs.deleteOne({ course: ObjectId(training._id) });
      await Category.updateOne(
        { Title: training.Category },
        { $pull: { Trainings: ObjectId(training._id) } }
      );

      if (training.Trainer !== "") {
        await Trainer.updateOne(
          { _id: ObjectId(training.Trainer) },
          { $pull: { Trainings: req.body.idTraining } }
        );
      }
      await Candidat.updateOne(
        { _id: { $in: training.enrolled } },
        {
          $pull: { TrainingsPaid: req.body.idTraining },
          $pull: { cartTrainings: req.body.idTraining },
        }
      );
      await Training.deleteOne({ _id: ObjectId(req.body.idTraining) });
      await TrainerNotifs.deleteOne({ course: ObjectId(req.body.idTraining) });

      res.status(201).send({ message: "user deleted successfully" });
      //console.log(users)
    }
    //res.status(401).send({ message: "you are not allowed to access to this data" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error);
  }
});

router.post("/updateTraining", authenticateToken, async (req, res) => {

  const id = req.user["_id"]
  //console.log(req.body)
  try {
    // const { error } = validate(req.body);
    // if (error)
    //     return res.status(400).send({ message: error.details[0].message });
    const oldTraining = await Training.findOne({ _id: req.body._id })
    await Category.updateOne({ Title: oldTraining.Category }, { $pull: { Trainings: oldTraining._id } })
    await Category.updateOne({ Title: req.body.Category }, { $push: { Trainings: req.body._id } })
    await Training.updateOne({ _id: req.body._id }, { $set: req.body })


    res.status(201).send({ message: "Training updated successfully" });
  } catch (error) {







    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error)
  }
});

function sum(array) {
  let sum = 0;
  console.log(array)
  for (let i = 0; i < array.length; i++) {
    sum += array[i].rate;
  }

  return sum
}

router.post("/Evaluate", authenticateToken, async (req, res) => {
  const id = req.user["_id"]
  try {
    console.log("//////////", req.body.courseId)
    const training = await Training.findOne({ "_id": ObjectId(req.body.courseId) })
    console.log(training)
    var sommeRating = sum(training.evaluate)

    var rating = (sommeRating + req.body.Data.rate) / (training.evaluate.length + 1)


    await Training.updateOne({ _id: req.body.courseId }, { $push: { evaluate: req.body.Data }, $set: { rating: rating } })

    res.status(200).send({ message: "Evaluation done" })
    console.log("done")
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error)
  }
})

//te5u el id mta3 el room ,room lel visio
router.post("/getRoom", authenticateToken, async (req, res) => {
  const id = req.user["_id"]
  //console.log(id)

  try {
    const room = await Room.findOne({ courseId: req.body.courseId })
    console.log("room: ", room)
    console.log("roomid: ", req.body.courseId)
    if (room) {
      res.status(201).send({ data: room.urlId, message: "rooms found" })
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