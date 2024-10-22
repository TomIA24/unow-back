const router = require("express").Router();
const {
  Sender,
  ContactAdmin,
  SendConfirmationEmail,
} = require("./emailSender");
const Joi = require("joi");

const validateCantact = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("name"),
    surname: Joi.string().required().label("surname"),
    message: Joi.string().required().label("message"),
    subject: Joi.string().required().label("subject"),
    email: Joi.string().email().required().label("email"),
  });

  return schema.validate(data);
};

router.post("/SendMessage", async (req, res) => {
  try {
    const { error } = validateCantact({
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      message: req.body.message,
      subject: req.body.subject,
    });
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    console.log(req.body);
    ContactAdmin(req.body);
    res.status(200).send({ message: "message sent successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log(error);
  }
});

router.post("/SendRequestTrainer", async (req, res) => {
  try {
    console.log(req.body);
    ContactAdmin(req.body);
    SendConfirmationEmail(req.body.name, req.body.email);
    res.status(200).send({ message: "request sent successfullyyyyyyyyyy" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
    console.log(error);
  }
});

module.exports = router;
