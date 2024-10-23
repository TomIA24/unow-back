const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authenticateToken = require("../middleware");
const { upload } = require("../helpers/filehelper");

router.post(
  "/",
  authenticateToken,
  upload.array("files"),
  questionController.createQuestion
);
router.get("/", authenticateToken, questionController.getQuestions);
router.get("/:id", authenticateToken, questionController.getQuestionById);
router.put("/:id", authenticateToken, questionController.updateQuestion);
router.delete("/:id", authenticateToken, questionController.deleteQuestion);

module.exports = router;
