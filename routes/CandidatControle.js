const router = require("express").Router();
const { Candidat, validate } = require("../models/Candidat");
const { Admin } = require("../models/Admin");
const { Trainer } = require("../models/Trainer");
const bcrypt = require("bcrypt");
const ObjectId = require("mongodb").ObjectID;
const jwt = require("jsonwebtoken");
const { Course } = require("../models/course");
const {
  TrainerNotifs,
  validateNotif,
} = require("../models/TrainerNotifications");

const { Training } = require("../models/Training");
const { Quiz } = require("../models/quizz");

function authenticateToken(req, res, next) {
  console.log("req: ", req.headers);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const decoded = jwt.decode(token);

  console.log(req.headers);
  console.log("token here : ", token);
  //console.log(decoded)
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}

router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).send("Quiz not found");
    res.send(quiz);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

router.post("/Signup", async (req, res) => {
  console.log("test");
  try {
    console.log("data from persoliazed data : ", req.body);
    const { error } = validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ message: error.details[0].message });
    }
    const user = await Candidat.findOne({ email: req.body.email });
    const admin = await Admin.findOne({ email: req.body.email });
    const trainer = await Trainer.findOne({ email: req.body.email });
    if (user || admin || trainer)
      return res
        .status(409)
        .send({ message: "User with given email already Exist!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    console.log("body: ", req.body);
    const candidat = await new Candidat({
      ...req.body,
      password: hashPassword,
    }).save();
    console.log("candidat: ", candidat);

    res.status(201).send({
      message: "User created successfully2",
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
});

router.post("/showCandidat", authenticateToken, async (req, res) => {
  try {
    const id = req.user["_id"];

    const admin = await Admin.findOne({ _id: ObjectId(id) });
    if (admin) {
      const users = await Candidat.find();
      res.status(201).send({ users: users });
    }
    //console.log(users)

    //res.status(401).send({ message: "you are not allowed to access to this data" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error);
  }
});

router.post("/deleteCandidat", authenticateToken, async (req, res) => {
  try {
    const id = req.user["_id"];
    const admin = await Admin.findOne({ _id: ObjectId(id) });
    if (admin) {
      console.log(req);
      await Candidat.deleteOne({ _id: ObjectId(req.body.idUser) });
      res.status(201).send({ message: "user deleted successfully" });
      //console.log(users)
    }
    //res.status(401).send({ message: "you are not allowed to access to this data" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error);
  }
});

//updateUser
router.post("/updateCandidat", authenticateToken, async (req, res) => {
  const id = req.user["_id"];
  // console.log(req.body)
  console.log("condidate update");
  try {
    // const { error } = validate(req.body);
    // if (error)
    //     return res.status(400).send({ message: error.details[0].message });
    await Candidat.updateOne({ _id: req.body._id }, { $set: req.body });

    res.status(201).send({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error);
  }
});

router.post("/lastSeen", authenticateToken, async (req, res) => {
  //const token = req.body.headers.Authorization.substr(7, )
  //const id = jwt.decode(token)["_id"]
  const id = req.user["_id"];
  try {
    //onsole.log(req.body)

    await Candidat.updateOne(
      { _id: id },
      { $set: { lastSeen: req.body.lastSeen } }
    );
    res.status(201).send({ message: "LastSeen updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    //console.log("/////////", error)
  }
});

router.post("/lastSeenTraining", authenticateToken, async (req, res) => {
  //const token = req.body.headers.Authorization.substr(7, )
  //const id = jwt.decode(token)["_id"]
  const id = req.user["_id"];
  try {
    //onsole.log(req.body)

    await Candidat.updateOne(
      { _id: id },
      { $push: { lastSeen: req.body.lastSeen } }
    );
    res.status(201).send({ message: "LastSeen updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    //console.log("/////////", error)
  }
});

router.post("/cart", authenticateToken, async (req, res) => {
  const id = req.user["_id"];
  console.log(req.body.type);

  try {
    if (req.body.type === "training") {
      const course = await Training.findOne({ _id: req.body.courseId });
      console.log(course.enrolled.length);

      //default functions

      // update training
      await Training.updateOne(
        { _id: req.body.courseId },
        { $push: { enrolled: req.body.enrolled }, state: "processing" }
      );

      // update condidate
      await Candidat.updateOne(
        { _id: ObjectId(id) },
        { $push: { cartTrainings: req.body.courseId } }
      );

      // training infos
      const courseEnrolled = await Training.findOne({
        _id: req.body.courseId,
      });

      console.log("courseEnrolled: ", courseEnrolled);

      // send notif

      if (courseEnrolled.enrolled.length + 1 > 2) {
        console.log("sup 3");

        var Notifs = [];
        Notifs = await TrainerNotifs.find({ course: req.body.courseId });

        if (Notifs.length > 0) {
          await TrainerNotifs.updateOne(
            { course: req.body.courseId },
            { $inc: { nbInscrit: 1 } }
          );
        }

        if (Notifs.length === 0) {
          console.log("inf: 0");

          var concernedTrainers = [];
          const trainers = await Trainer.find();

          trainers.map((tr) => {
            if (tr.programs.includes(courseEnrolled.certificate)) {
              concernedTrainers.push(tr);
            }
          });
          console.log("first");
          console.log("////concernedTrainers////" + concernedTrainers);

          concernedTrainers.map(async (trainer) => {
            const notif = {
              trainer: trainer._id,
              course: courseEnrolled._id,
              courseCertif: courseEnrolled.certificate,
              courseDate: courseEnrolled.Date[0],
              nbInscrit: courseEnrolled.enrolled.length,
              reponseFormateur: "pending",
              prixFormateur: "Not Yet",
              StatusMandate: "pending",
            };

            console.log(notif);

            const { error } = validateNotif(notif);

            console.log(error);

            if (!error) {
              console.log(error);
            }

            await new TrainerNotifs(notif).save();
          });
        }
      }

      res.status(201).send({ message: "cart updated successfully" });
    }

    if (req.body.type === "course") {
      await Candidat.updateOne(
        { _id: id },
        { $push: { cartCourses: req.body.courseId } }
      );
      await Course.updateOne(
        { _id: req.body.courseId },
        { $push: { enrolled: id } }
      );
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error);
  }
});

// router.post("/buy", authenticateToken, async(req, res) => {
//     const id = req.user["_id"]

//     try {

//         const user = await Candidat.findOne({ _id: id })
//         if (Candidat.cartCourses) {
//             if (Candidat.cartCourses.includes(JSON.stringify({ state: "unpaid", course: ObjectId(req.body.coursePaid) }))) {
//                 Candidat.cartCourses.map(course => {

//                     if (course.course.equals(ObjectId(req.body.coursePaid))) {
//                         course.state = "paid"
//                     }
//                 })
//             } else {
//                 Candidat.cartCourses.push({ state: "paid", course: ObjectId(req.body.coursePaid) })
//             }

//             await Candidat.updateOne({ _id: id }, { cartCourses: Candidat.cartCourses })
//         }

//     } catch (error) {

//         console.log(error)

//     }

// })

router.post("/buyInCart", authenticateToken, async (req, res) => {
  const id = req.user["_id"];
  try {
    const Candidat = await Candidat.findOne({ _id: id });
    if (Candidat.cartCourses) {
      Candidat.cartCourses.map((course) => {
        if (course.course.equals(ObjectId(req.body.courseId))) {
          course.state = "paid";
        }
      });

      await Candidat.updateOne(
        { _id: id },
        { cartCourses: Candidat.cartCourses }
      );
      console.log("done");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/returnCandidatForRatingInfo", async (req, res) => {
  try {
    console.log(req.body.ids);
    const usersLimited = await Candidat.find(
      { _id: { $in: req.body.ids } },
      { _id: 1, userName: 1, image: 1 }
    );
    console.log(usersLimited);

    res.status(200).send({ usersLimited: usersLimited, message: "success" });
  } catch (err) {
    console.log(err);
  }
});

router.patch("/:id", async (req, res) => {
  console.log("iduser", req.params.id);
  console.log("personlizedata", req.body);
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const candidate = await Candidat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Returns the updated document and applies validation
    );

    if (!candidate) return res.status(404).send("Candidate not found");

    res.send(candidate);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});
router.patch("/:id", async (req, res) => {
  console.log("iduser", req.params.id);
  console.log("personlizedata", req.body);
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const candidate = await Candidat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Returns the updated document and applies validation
    );

    if (!candidate) return res.status(404).send("Candidate not found");

    res.send(candidate);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/checkfields/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const candidat = await Candidat.findById(id);

    if (!candidat) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const requiredFields = [
      "interests",
      "exploreFirst",
      "goals",
      "timeline",
      // 'availability',
      "style",
      "hoursperweek",
      "learningother",
      // 'learningpace',
      "dayslearning",
      "timeOfDay",
    ];

    // Find missing fields
    const missingFields = requiredFields.filter((field) => {
      const value = candidat[field];
      return !value || (Array.isArray(value) && value.length === 0);
    });

    if (missingFields.length > 0) {
      return res.status(200).json({
        message: "Some fields are missing",
        missingFields,
      });
    }

    return res.status(200).json({ message: "All required fields are filled" });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error });
  }
});

router.get("/candidates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const candidat = await Candidat.findById(id);

    if (!candidat) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json(candidat);
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
});

router.patch("/step1/:id", async (req, res) => {
  console.log("step1");

  const { error } = validate(req.body);
  if (error) {
    console.log("Validation error:", error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const { interests = [], exploreFirst = "" } =
    req.body.stepPersonalize_1 || {};
  const candidat = await Candidat.findById(req.params.id);
  try {
    let updateData = {
      $set: { stepPersonalize_1: req.body.stepPersonalize_1 },
    };

    if (interests.length > 0 && exploreFirst.trim() != "") {
      if (
        candidat.stepPersonalize_1.interests.length === 0 &&
        candidat.stepPersonalize_1.exploreFirst.trim() === ""
      ) {
        updateData = {
          ...updateData,
          $inc: { profilecomplited: +20 },
        };
      } else {
        updateData = {
          ...updateData,
        };
      }
    }

    const candidate = await Candidat.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!candidate) return res.status(404).send("Candidate not found");

    res.send(candidate);
  } catch (err) {
    console.error("Error updating candidate:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route pour la deuxième étape de personalize
router.patch("/step2/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    console.log("Validation error:", error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const { goals = [], timeline = "" } = req.body.stepPersonalize_2 || {};
  const candidat = await Candidat.findById(req.params.id);
  try {
    let updateData = {
      $set: { stepPersonalize_2: req.body.stepPersonalize_2 },
    };

    if (goals.length > 0 && timeline.trim() != "") {
      if (
        candidat.stepPersonalize_2.goals.length === 0 &&
        candidat.stepPersonalize_2.timeline.trim() === ""
      ) {
        updateData = {
          ...updateData,
          $inc: { profilecomplited: +20 },
        };
      } else {
        updateData = {
          ...updateData,
        };
      }
    }

    const candidate = await Candidat.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!candidate) return res.status(404).send("Candidate not found");

    res.send(candidate);
  } catch (err) {
    console.error("Error updating candidate:", err);
    res.status(500).send("Internal Server Error");
  }
});
// Route pour la troisième étape de personalize
router.patch("/step3/:id", async (req, res) => {
  console.log("step3");

  const { error } = validate(req.body);
  if (error) {
    console.log("Validation error:", error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const {
    availability = [],
    hoursperweek = "",
    learningother = "",
  } = req.body.stepPersonalize_3 || {};
  const candidat = await Candidat.findById(req.params.id);
  try {
    let updateData = {
      $set: { stepPersonalize_3: req.body.stepPersonalize_3 },
    };

    if (
      availability.length > 0 &&
      hoursperweek.trim() != "" &&
      learningother.trim() != ""
    ) {
      if (
        candidat.stepPersonalize_3.learningother.trim() == "" &&
        candidat.stepPersonalize_3.availability.length == 0 &&
        candidat.stepPersonalize_3.hoursperweek.trim() == ""
      ) {
        updateData = {
          ...updateData,
          $inc: { profilecomplited: +20 },
        };
      }
      if (
        candidat.stepPersonalize_3.learningother.trim() == "" &&
        candidat.stepPersonalize_3.availability.length >= 0 &&
        candidat.stepPersonalize_3.hoursperweek.trim() != ""
      ) {
        updateData = {
          ...updateData,
        };
      }
    }

    console.log("Updating candidate with ID:", req.params.id);
    console.log("Update data:", updateData);

    const candidate = await Candidat.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!candidate) return res.status(404).send("Candidate not found");

    res.send(candidate);
  } catch (err) {
    console.error("Error updating candidate:", err);
    res.status(500).send("Internal Server Error");
  }
});
// Route pour la quatrième étape de personalize
router.patch("/step4/:id", async (req, res) => {
  console.log("step3");

  const { error } = validate(req.body);
  if (error) {
    console.log("Validation error:", error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const {
    learningpace = [],
    dayslearning = "",
    timeOfDay = "",
  } = req.body.stepPersonalize_4 || {};
  const candidat = await Candidat.findById(req.params.id);
  try {
    let updateData = {
      $set: { stepPersonalize_4: req.body.stepPersonalize_4 },
    };

    if (
      learningpace.length > 0 &&
      dayslearning.trim() != "" &&
      timeOfDay.trim() != ""
    ) {
      if (
        candidat.stepPersonalize_4.timeOfDay.trim() == "" &&
        candidat.stepPersonalize_4.learningpace.length == 0 &&
        candidat.stepPersonalize_4.dayslearning.trim() == ""
      ) {
        updateData = {
          ...updateData,
          $inc: { profilecomplited: +20 },
        };
      }
      if (
        candidat.stepPersonalize_4.timeOfDay.trim() == "" &&
        candidat.stepPersonalize_4.learningpace.length >= 0 &&
        candidat.stepPersonalize_4.dayslearning.trim() != ""
      ) {
        updateData = {
          ...updateData,
        };
      }
    }

    console.log("Updating candidate with ID:", req.params.id);
    console.log("Update data:", updateData);

    const candidate = await Candidat.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!candidate) return res.status(404).send("Candidate not found");

    res.send(candidate);
  } catch (err) {
    console.error("Error updating candidate:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
