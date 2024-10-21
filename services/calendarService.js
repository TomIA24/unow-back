const { Trainer } = require("../models/Trainer");
const CalendarEvent = require("../models/CalendarEvent");
const { startOfDay, format, endOfDay } = require("date-fns");
const {
  isDateEqual,
  addDays,
  isDateGreater,
  isWithinIntervalWrapper,
} = require("../utils/dateUtils");

const createUnavailabilityEvent = async (trainerId, eventData) => {
  const trainer = await Trainer.findById(trainerId).select("_id events");
  if (!trainer) throw new Error("Trainer not found");

  const existingUnavailabilityEvent = await CalendarEvent.findOne({
    trainer: trainerId,
    type: "unavailability",
    $or: [
      {
        startDate: { $lte: eventData.startDate },
        endDate: { $gte: eventData.startDate },
      },
    ],
  });

  if (existingUnavailabilityEvent) {
    throw new Error("Unavailability event already exists");
  }

  const overlappingTraining = await CalendarEvent.findOne({
    trainer: trainerId,
    type: "training",
    $or: [
      {
        startDate: { $lte: eventData.startDate },
        endDate: { $gte: eventData.startDate },
      },
    ],
  });

  if (overlappingTraining) {
    await handleOverlappingTraining(
      overlappingTraining,
      format(eventData.startDate, "yyyy-MM-dd"),
      format(eventData.endDate, "yyyy-MM-dd"),
      trainerId
    );
  }

  const calendarEvent = new CalendarEvent({
    ...eventData,
    trainer: trainerId,
    type: "unavailability",
  });
  await calendarEvent.save();

  await Trainer.findByIdAndUpdate(trainerId, {
    $push: { events: calendarEvent._id },
  });

  return calendarEvent;
};

const handleOverlappingTraining = async (
  overlappingTraining,
  startDate,
  endDate,
  trainerId
) => {
  const isEqualToStartDate = isDateEqual(
    overlappingTraining.startDate,
    startDate
  );
  const isEqualToEndDate = isDateEqual(overlappingTraining.endDate, endDate);
  const isBetween = isWithinIntervalWrapper(
    startDate,
    overlappingTraining.startDate,
    overlappingTraining.endDate
  );

  if (isEqualToStartDate) {
    if (format(overlappingTraining.endDate, "yyyy-MM-dd") === startDate) {
      await CalendarEvent.findByIdAndDelete(overlappingTraining._id);
    }
    if (isDateGreater(overlappingTraining.endDate, startDate)) {
      await CalendarEvent.findByIdAndUpdate(overlappingTraining._id, {
        startDate: startOfDay(addDays(startDate, 1)),
      });
    }
  } else if (isEqualToEndDate) {
    await CalendarEvent.findByIdAndUpdate(overlappingTraining._id, {
      endDate: endOfDay(addDays(endDate, -1)),
    });
  } else if (isBetween) {
    await CalendarEvent.findByIdAndUpdate(overlappingTraining._id, {
      endDate: endOfDay(addDays(startDate, -1)),
    });

    const newTraining = new CalendarEvent({
      type: "training",
      title: overlappingTraining.title,
      color: overlappingTraining.color,
      startDate: addDays(startDate, 1),
      endDate: overlappingTraining.endDate,
      reason: overlappingTraining.reason,
      training: overlappingTraining.training,
      trainer: trainerId,
    });
    await newTraining.save();

    await Trainer.findByIdAndUpdate(trainerId, {
      $push: { events: newTraining._id },
    });
  }
};

module.exports = {
  createUnavailabilityEvent,
};
