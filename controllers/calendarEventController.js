const { Training } = require("../models/Training");
const { Trainer } = require("../models/Trainer");
const CalendarEvent = require("../models/Calendar");

const createUnavailabilityEvent = async (req, res) => {
  const {
    startDate,
    endDate,
    reason,
    unavailabilityDetails,
    updateAvailability,
  } = req.body;

  try {
    const trainer = await Trainer.findById(req.user._id);
    if (!trainer) return res.status(404).send("Trainer not found");

    const calendarEventData = {
      type: "unavailability",
      startDate,
      endDate,
      reason,
      unavailabilityDetails,
      updateAvailability,
      trainer: req.user._id,
    };

    const calendarEvent = new CalendarEvent(calendarEventData);
    await calendarEvent.save();

    res.status(201).send({ calendarEvent, trainer });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const assignTrainingEvent = async (req, res) => {
  const { startDate, endDate, training, trainerId } = req.body;

  try {
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).send("Trainer not found");

    const trainingInstance = await Training.findById(training);
    if (!trainingInstance) return res.status(404).send("Training not found");

    const calendarEventData = {
      type: "training",
      startDate,
      endDate,
      training: trainingInstance._id,
      trainer: trainer._id,
    };

    const calendarEvent = new CalendarEvent(calendarEventData);
    await calendarEvent.save();

    res.status(201).send({ calendarEvent, trainer });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const updateCalendarEvent = async (req, res) => {
  const {
    type,
    startDate,
    endDate,
    reason,
    unavailabilityDetails,
    updateAvailability,
    training,
  } = req.body;

  try {
    let updateData = {
      type,
      startDate,
      endDate,
      reason,
      updateAvailability,
    };

    if (type === "unavailability") {
      updateData.unavailabilityDetails = unavailabilityDetails;
    } else if (type === "training") {
      const trainingInstance = await Training.findById(training);
      if (!trainingInstance) return res.status(404).send("Training not found");

      updateData.training = trainingInstance._id;
    }

    const calendarEvent = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    )
      .populate("training")
      .populate("trainer");

    if (!calendarEvent) {
      return res.status(404).send("Calendar event not found");
    }

    res.status(200).send(calendarEvent);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteCalendarEvent = async (req, res) => {
  try {
    const calendarEvent = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!calendarEvent) {
      return res.status(404).send("Calendar event not found");
    }
    res.status(200).send(calendarEvent);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCalendarEvents = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.user._id);
    if (!trainer) return res.status(404).send("Trainer not found");

    const calendarEvents = await CalendarEvent.find({ trainer: req.user._id })
      .populate("training")
      .populate("trainer")
      .sort({ startDate: 1 });

    res.status(200).send(calendarEvents);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  getCalendarEvents,
  createUnavailabilityEvent,
  assignTrainingEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
};
