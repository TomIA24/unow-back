const express = require("express");
const router = express.Router();
const { Program } = require("../models/Program");
const authenticateToken = require("../middleware");
const { Trainer } = require("../models/Trainer");

router.post("/", authenticateToken, async (req, res) => {
  try {
    const program = new Program({
      title: req.body.title,
      certifying: req.body.certifying,
      duration: req.body.duration,
      tj: req.body.tj,
    });
    await program.save();
    const trainer = await Trainer.findById(req.user._id);
    if (!trainer) return res.status(404).send("Trainer not found");

    trainer.programs.push(program._id);
    await trainer.save();

    res.status(201).send({ program, trainer });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
