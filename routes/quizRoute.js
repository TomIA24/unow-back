const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const authenticateToken = require("../middleware");

router.post("/", authenticateToken, quizController.createQuiz);
router.get("/", authenticateToken, quizController.getQuizzes);
router.get("/generate/:id", authenticateToken, quizController.generateQuiz);
router.get("/:id", authenticateToken, quizController.getQuizById);
router.put("/:id", authenticateToken, quizController.updateQuiz);
router.delete("/:id", authenticateToken, quizController.deleteQuiz);

module.exports = router;
