const router = require("express").Router();
require("dotenv").config();
const ObjectId = require("mongodb").ObjectID;
const { Trainer, validate } = require("../models/Trainer");
const { Candidat } = require("../models/Candidat");
const { Admin } = require("../models/Admin");
const { Evaluation, validateEvaluation } = require("../models/evaluation");
const { Category, validateCategory } = require("../models/Category");

const jwt = require("jsonwebtoken");
const { Training } = require("../models/Training");
const { Course } = require("../models/course");
//test
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
router.get("/specificGroupeFromCategory/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { type, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const category = await Category.findOne({ _id: id });

    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    let data;

    if (type === "courses" && category.Courses) {
      data = await Course.find({ _id: { $in: category.Courses } })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      return res.status(200).send({
        data,
        page: pageNumber,
        limit: limitNumber,
        total: category.Courses.length,
        message: "Specific courses",
      });
    }

    if (type === "trainings" && category.Trainings) {
      data = await Training.find({ _id: { $in: category.Trainings } })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      return res.status(200).send({
        data,
        page: pageNumber,
        limit: limitNumber,
        total: category.Trainings.length,
        message: "Specific trainings",
      });
    }

    return res.status(400).send({ message: "Invalid type or no data found" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.post("/setCategory", authenticateToken, async (req, res) => {
  const id = req.user["_id"];

  try {
    console.log(req.body.Category);
    await Category({
      Title: req.body.Category,
      Courses: null,
      Trainings: null,
    }).save();

    res.status(200).send({ message: "Category saved" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error);
  }
});

router.post("/deleteCategory", authenticateToken, async (req, res) => {
  const id = req.user["_id"];

  try {
    await Category.deleteOne({ _id: req.body.id });

    res.status(200).send({ message: "Category deleted" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error);
  }
});

router.get("/getCategories", async (req, res) => {
  try {
    const cats = await Category.find();

    res.status(200).send({ data: cats, message: "All Categories" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log("/////////", error);
  }
});

module.exports = router;
