const { Training } = require("../models/Training");
const { Trainer } = require("../models/Trainer");
const CalendarEvent = require("../models/CalendarEvent");
const { format, addDays, isWithinInterval } = require("date-fns");
const { is } = require("date-fns/locale");

const createUnavailabilityEvent = async (req, res) => {
  const {
    title,
    color,
    startDate,
    endDate,
    reason,
    unavailabilityDetails,
    updateAvailability,
  } = req.body;

  try {
    const trainer = await Trainer.findById(req.user._id);
    if (!trainer) return res.status(404).send("Trainer not found");

    const isUnavailabilityEventExists = await CalendarEvent.findOne({
      trainer: req.user._id,
      type: "unavailability",
      startDate,
      endDate,
    });

    if (isUnavailabilityEventExists) {
      return res
        .status(400)
        .send({ message: "Unavailability event already exists" });
    }

    const overlappingTraining = await CalendarEvent.findOne({
      trainer: req.user._id,
      type: "training",
      $or: [
        {
          startDate: { $lte: startDate },
          endDate: { $gte: startDate },
        },
      ],
    });

    if (overlappingTraining) {
      const isEqualToStartDate =
        format(overlappingTraining.startDate, "yyyy-MM-dd") === startDate;
      const isEqualToEndDate =
        format(overlappingTraining.endDate, "yyyy-MM-dd") === endDate;
      const isBetween = isWithinInterval(startDate, {
        start: overlappingTraining.startDate,
        end: overlappingTraining.endDate,
      });

      if (isEqualToStartDate) {
        if (format(overlappingTraining.endDate, "yyyy-MM-dd") === startDate) {
          await CalendarEvent.findByIdAndDelete(overlappingTraining._id);
        }
        if (format(overlappingTraining.endDate, "yyyy-MM-dd") > startDate) {
          await CalendarEvent.findByIdAndUpdate(overlappingTraining._id, {
            startDate: addDays(startDate, 1),
          });
        }
      }

      if (isEqualToEndDate) {
        await CalendarEvent.findByIdAndUpdate(overlappingTraining._id, {
          endDate: addDays(endDate, -1),
        });
      }

      if (!isEqualToStartDate && !isEqualToEndDate && isBetween) {
        await CalendarEvent.findByIdAndUpdate(overlappingTraining._id, {
          endDate: addDays(startDate, -1),
        });

        const newTraining = new CalendarEvent({
          type: "training",
          title: overlappingTraining.title,
          color: overlappingTraining.color,
          startDate: addDays(startDate, 1),
          endDate: overlappingTraining.endDate,
          reason: overlappingTraining.reason,
          training: overlappingTraining.training,
          trainer: req.user._id,
        });
        await newTraining.save();
        await Trainer.findByIdAndUpdate(req.user._id, {
          $push: { events: newTraining._id },
        });
      }
    }

    const calendarEventData = {
      type: "unavailability",
      title,
      color,
      startDate,
      endDate,
      reason,
      unavailabilityDetails,
      updateAvailability,
      trainer: req.user._id,
    };

    const calendarEvent = new CalendarEvent(calendarEventData);
    await calendarEvent.save();
    const updatedTrainer = await Trainer.findByIdAndUpdate(req.user._id, {
      $push: { events: calendarEvent._id },
    });

    res.status(201).send({ calendarEvent, trainer: updatedTrainer });
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

    res.status(201).send({
      message: "Calendar event created successfully",
      calendarEvent,
      trainer,
    });
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

    const calendarEvents = await CalendarEvent.find({
      trainer: req.user._id,
    }).sort({ startDate: 1 });

    res.status(200).send({ data: calendarEvents });
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
