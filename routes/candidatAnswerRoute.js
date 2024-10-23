const express = require("express");
const router = express.Router();
const candidatAnswerController = require("../controllers/candidatAnswerController");
const authenticateToken = require("../middleware");

router.post(
  "/",
  authenticateToken,
  candidatAnswerController.createCandidatAnswer
);
router.get("/", authenticateToken, candidatAnswerController.getCandidatAnswers);
router.get(
  "/:id",
  authenticateToken,
  candidatAnswerController.getCandidatAnswerById
);
router.put(
  "/:id",
  authenticateToken,
  candidatAnswerController.updateCandidatAnswer
);
router.delete(
  "/:id",
  authenticateToken,
  candidatAnswerController.deleteCandidatAnswer
);

module.exports = router;
