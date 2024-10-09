const { Category } = require("../models/Category");
const { Program } = require("../models/Program");
const { Trainer } = require("../models/Trainer");

const createProgram = async (req, res) => {
  const { title, certifying, duration, tj } = req.body;

  try {
    const category = await Category.findOne({ Title: req.body.category });

    if (!category) return res.status(404).send("Category not found");
    const program = new Program({
      title: title,
      certifying: certifying,
      duration: duration,
      tj: tj,
      category: category._id,
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
};

const updateProgram = async (req, res) => {
  const { title, certifying, duration, tj } = req.body;
  try {
    const category = await Category.findOne({ Title: req.body.category });

    if (!category) return res.status(404).send("Category not found");

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { title, certifying, duration, tj, category: category._id },
      {
        new: true,
      }
    );
    res.status(200).send(program);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    res.status(200).send(program);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  createProgram,
  updateProgram,
  deleteProgram,
};
