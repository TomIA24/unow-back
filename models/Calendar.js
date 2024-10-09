const mongoose = require("mongoose");

const CalendarEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["unavailability", "training"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    unavailabilityDetails: {
      isFirmUnavailable: { type: Boolean },
      alternativeDates: [{ type: Date }],
      comment: { type: String },
    },
    updateAvailability: { type: Boolean },

    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training",
      required: function () {
        return this.type === "training";
      },
    },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
  },
  {
    timestamps: true,
  }
);

const CalendarEvent = mongoose.model("CalendarEvent", CalendarEventSchema);

module.exports = CalendarEvent;
