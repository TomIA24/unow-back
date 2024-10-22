const express = require("express");
const router = express.Router();
const answerController = require("../controllers/answerController");
const authenticateToken = require("../middleware");

router.post("/", authenticateToken, answerController.createAnswer);
router.get("/", authenticateToken, answerController.getAnswers);
router.get("/:id", authenticateToken, answerController.getAnswerById);
router.put("/:id", authenticateToken, answerController.updateAnswer);
router.delete("/:id", authenticateToken, answerController.deleteAnswer);

module.exports = router;
