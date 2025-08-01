// utils/isMarketHoliday.js
const holidays = [
  "2025-01-26","2025-02-26", "2025-03-31", "2025-04-10", "2025-04-14", "2025-04-18",
  "2025-05-01", "2025-08-15", "2025-08-27", "2025-10-26","2025-10-21","2025-10-22","2025-11-05","2025-12-25"
  // Add any additional NSE/BSE holidays here
];

const isMarketHoliday = () => {
  const indiaDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const today = indiaDate.toISOString().split("T")[0];
  return holidays.includes(today);
};

module.exports = isMarketHoliday;
