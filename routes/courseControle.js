require("dotenv").config();
const router = require("express").Router();
const { Course } = require("../models/course");
const jwt = require("jsonwebtoken");
const ObjectId = require('mongodb').ObjectID;
const { Admin } = require("../models/Admin");
const { Category } = require("../models/Category");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const decoded = jwt.decode(token);
  //console.log(req.headers)
  // console.log(token)
  //console.log(decoded)
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}
router.get("/enrolled/:courseId", async (req, res) => {
  try {
  
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).send("Course not found");

    
      const enrolledCount = course.enrolled ? course.enrolled.length : 0;


      res.send({ enrolledCount });
  } catch (error) {
      res.status(500).send("Something went wrong");
  }
});
router.post("/", async (req, res) => {
  try {
    const courses = await Course.find();
    console.log("test");
    res.status(200).send({ data: courses, message: "All courses" });
  } catch (error) {
    //console.log(error)
    res.status(500).send({ message: "Internal Server Error", error: error });
    //console.log(error)
  }
});

router.post("/CreateCourse", authenticateToken, async (req, res) => {
  //const token = req.body.headers.Authorization.substr(7, )
  //const id = jwt.decode(token)["_id"]
  const idUser = req.user["_id"];
  try {
    // const { error } = validate(req.body);
    // if (error) {
    //     res.status(400).send({ message: error.details[0].message });
    //     console.log("400 hello", error)
    // }

    const course = await Course.findOne({ Title: req.body.Title });
    if (course) {
      return res
        .status(409)
        .send({ message: "course with given Title already Exist!" });
    } else {
      const savedCourse = await new Course(req.body).save();
      console.log("saved1");

      await Category.updateOne(
        { Title: req.body.Category },
        { $push: { Courses: savedCourse._id } }
      );

      return res.status(201).send({
        message: "course created successfully",
        id: savedCourse._id,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "course failed", error: err });
  }
});

router.get("/specific", async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id);
        const course = await Course.findById(ObjectId(id));
        console.log(course);
        res.status(200).send({ data: course, message: "One course" });
    } catch (error) {
        //console.log(error)
        res.status(500).send({ message: "Internal Server Error", error: error });
        //console.log(error)
    }
});

//
router.post("/specificGroupe", authenticateToken, async (req, res) => {
    try {
        console.log(req.body);

        const course = await Course.find({ _id: { $in: req.body.cardIds } });
        // console.log(course)
        res.status(200).send({ data: course, message: "All Course" });
    } catch (error) {
        console.log("error : ", error);
        res.status(500).send({ message: "Internal Server Error", error: error });
        //console.log(error)
    }
});
router.post("/specificGroupeFromCategory", async (req, res) => {
    try {
        console.log(req.body);
        console.log("here: ", req.body);
        if (Array.isArray(req.body)) {
            const course = await Course.find({ _id: { $in: req.body } });
            // console.log(course)
            return res.status(200).send({ data: course, message: "All Course" });
        }
        const course = await Course.find();
        res.status(200).send({ data: course, message: "All Course" });

    } catch (error) {
        console.log("error : ", error);
        res.status(500).send({ message: "Internal Server Error", error: error });
        //console.log(error)
    }
});

router.post("/deleteCourse", authenticateToken, async (req, res) => {

    try {
        const id = req.user["_id"]
        //console.log(req.body.idCourse)
        const admin = await Admin.findOne({ _id: ObjectId(id) });
        //console.log(admin)

        if (admin) {

            await Course.deleteOne({ _id: ObjectId(req.body.idCourse) });
            res.status(201).send({ message: "user deleted successfully" });
            //console.log(users)
        }
        //res.status(401).send({ message: "you are not allowed to access to this data" });

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
});

router.post("/updateCourse", authenticateToken, async (req, res) => {

    const id = req.user["_id"]
    //console.log(req.body)
    try {
        // const { error } = validate(req.body);
        // if (error)
        //     return res.status(400).send({ message: error.details[0].message });
        await Course.updateOne({ _id: req.body._id }, { $set: req.body })

        res.status(201).send({ message: "Course updated successfully" });
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
        const course = await Course.findOne({ "_id": ObjectId(req.body.courseId) })
        console.log(course)
        var sommeRating = sum(course.evaluate)

        var rating = (sommeRating + req.body.Data.rate) / (course.evaluate.length + 1)


        await Course.updateOne({ _id: req.body.courseId }, { $push: { evaluate: req.body.Data }, $set: { rating: rating } })

        res.status(200).send({ message: "Evaluation done" })
        console.log("done")
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log("/////////", error)
    }
})


module.exports = router;