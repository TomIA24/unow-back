const { format, isWithinInterval, addDays } = require("date-fns");

const isDateEqual = (date1, date2) =>
  format(date1, "yyyy-MM-dd") === format(date2, "yyyy-MM-dd");

const isWithinIntervalWrapper = (date, startDate, endDate) => {
  return isWithinInterval(new Date(date), {
    start: new Date(startDate),
    end: new Date(endDate),
  });
};

const isDateGreater = (date1, date2) => new Date(date1) > new Date(date2);

module.exports = {
  isDateEqual,
  isWithinIntervalWrapper,
  addDays,
  isDateGreater,
};
