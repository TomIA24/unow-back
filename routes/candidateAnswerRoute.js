const express = require("express");
const router = express.Router();
const candidateAnswerController = require("../controllers/candidateAnswerController");
const authenticateToken = require("../middleware");

router.post(
  "/",
  authenticateToken,
  candidateAnswerController.createCandidateAnswer
);
router.get(
  "/",
  authenticateToken,
  candidateAnswerController.getCandidateAnswers
);
router.get(
  "/:id",
  authenticateToken,
  candidateAnswerController.getCandidateAnswerById
);
router.put(
  "/:id",
  authenticateToken,
  candidateAnswerController.updateCandidateAnswer
);
router.delete(
  "/:id",
  authenticateToken,
  candidateAnswerController.deleteCandidateAnswer
);

module.exports = router;
