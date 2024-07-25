const router = require("express").Router();
const { NewsletterClient, validate } = require("../models/NewsletterClient");



router.post("/", async(req, res) => {
    try {
        const { error } = validate(req.body.email);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        console.log(req.body.email)

        await NewsletterClient(req.body.email).save()

        res.status(200).send({ message: "saved successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)

    }
});




module.exports = router;