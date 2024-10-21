const express = require("express");
const router = express.Router();
const {
  assignTrainingEvent,
  createUnavailabilityEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} = require("../controllers/calendarEventController");
const authenticateToken = require("../middleware");

router.post("/", authenticateToken, createUnavailabilityEvent);
router.post("/assignTrainingEvent", authenticateToken, assignTrainingEvent);
router.get("/", authenticateToken, getCalendarEvents);
router.patch("/:id", authenticateToken, updateCalendarEvent);
router.delete("/:id", authenticateToken, deleteCalendarEvent);

module.exports = router;
