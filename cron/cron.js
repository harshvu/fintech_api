const cron = require("node-cron");
const { predictStocks: predictStocksPre } = require("../controllers/predictController");
const { predictStocks: predictStocksIn } = require("../controllers/predictControllerIn");
const { validatepredictStocks: validatepredictStocksPre } = require("../controllers/validatepredictController");
const { validatepredictStocks: validatepredictStocksIn } = require("../controllers/validatepredictInController");
const { predictStocks: DailyUpdates } = require("../controllers/DailyUpdatesController");
const { predictStocks: NewsUpdates } = require("../controllers/newsUpdatesController");

const mockRes = {
  json: (data) => console.log("✅ Cron success:", data),
  status: (code) => ({
    json: (err) => console.error(`❌ Cron failed [${code}]:`, err),
  }),
};

// Remove io usage if you’re not using socket anymore
const reqMock = {}; // No need to mock `app.get("io")`

// --- Cron Wrappers ---
const runPredictStocksPre = () => predictStocksPre(reqMock, mockRes);
const runPredictStocksIn = () => predictStocksIn(reqMock, mockRes);
const runValidatePredictPre = () => validatepredictStocksPre(reqMock, mockRes);
const runValidatePredictIn = () => validatepredictStocksIn(reqMock, mockRes);
const runDailyUpdates = () => DailyUpdates(reqMock, mockRes);
const runNewsUpdates = () => NewsUpdates(reqMock, mockRes);

// --- Cron Schedules ---

// 🕗 Pre-Market Prediction — 8:30 AM
cron.schedule("30 11 * * *", () => {
  console.log("⏱️ Running: Pre-Market Prediction (11:30 AM)");
  runPredictStocksPre();
}, { timezone: "Asia/Kolkata" });



// Run every 10 minutes from 12:20 AM onwards
cron.schedule("50 10-22/2 * * *", () => {
  const indiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  console.log(`⏱️ Running: Intra-Day Prediction at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runPredictStocksIn();
}, { timezone: "Asia/Kolkata" });


// 🕥 Intra-Day Validation — every 2 hours from 10:40 AM to 4:00 PM
// cron.schedule("40 10-16/2 * * *", () => {
//   const now = new Date();
//   const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
//   const hour = indiaTime.getHours();
//   const minute = indiaTime.getMinutes();

//   if (hour === 16 && minute > 0) {
//     console.log("⛔ Skipping: Validation after 4:00 PM IST");
//     return;
//   }

//   console.log(`⏱️ Running: Intra-Day Validation at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
//   runValidatePredictIn();
// }, { timezone: "Asia/Kolkata" });

// 📆 Daily Updates — 9:01 AM
// cron.schedule("1 9 * * *", () => {
//   console.log("⏱️ Running: Daily Updates (9:01 AM)");
//   runDailyUpdates();
// }, { timezone: "Asia/Kolkata" });

// 📰 News Updates — every hour before 3:30 PM
// cron.schedule("1 * * * *", () => {
//   const now = new Date();
//   const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
//   const hour = indiaTime.getHours();
//   const minute = indiaTime.getMinutes();

//   if (hour > 15 || (hour === 15 && minute > 30) || hour >= 18) {
//     console.log("⛔ Skipping: News Updates after 3:30 PM or 6 PM");
//     return;
//   }

//   console.log(`📰 Running: News Updates at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
//   runNewsUpdates();
// }, { timezone: "Asia/Kolkata" });

