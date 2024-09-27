const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware");
const {
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programController");

router.post("/", authenticateToken, createProgram);
router.patch("/:id", authenticateToken, updateProgram);
router.delete("/:id", authenticateToken, deleteProgram);

module.exports = router;
