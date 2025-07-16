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
cron.schedule("20 8 * * *", () => {
  console.log("⏱️ Running: Pre-Market Prediction (11:30 AM)");
  runPredictStocksPre();
}, { timezone: "Asia/Kolkata" });



// Run every 10 minutes from 12:20 AM onwards
cron.schedule("15 9,11,13,15 * * *", () => {
  const indiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  console.log(`⏱️ Running: Intra-Day Prediction at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runPredictStocksIn();
}, { timezone: "Asia/Kolkata" });

cron.schedule("30 9 * * *", () => {
  const indiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  console.log(`⏱️ Running: Intra-Day Validation at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runValidatePredictPre();
}, { timezone: "Asia/Kolkata" });
// 🕥 Intra-Day Validation — every 2 hours from 10:40 AM to 4:00 PM
cron.schedule("40 15 * * *", () => {
  const indiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  console.log(`⏱️ Running: Intra-Day Validation at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runValidatePredictIn();
}, { timezone: "Asia/Kolkata" });

// 📆 Daily Updates — 9:01 AM
let hasRunToday = false;

cron.schedule("1 9 * * *", () => {
  if (!hasRunToday) {
    console.log("⏱️ Running: Daily Updates (9:01 AM)");
    runDailyUpdates();
    hasRunToday = true;
  }
}, { timezone: "Asia/Kolkata" });

// Optional: Reset the flag at midnight
cron.schedule("0 0 * * *", () => {
  hasRunToday = false;
}, { timezone: "Asia/Kolkata" });

cron.schedule("15 * * * *", () => {
  const now = new Date();
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const hour = indiaTime.getHours();
  const minute = indiaTime.getMinutes();

  // Allow from 9:15 AM to 3:15 PM (last allowed run starts at 3:15 PM)
  if (hour < 9 || (hour === 9 && minute < 15) || hour > 15 || (hour === 15 && minute > 15)) {
    console.log("⛔ Skipping: News Updates outside 9:15 AM to 3:15 PM window");
    return;
  }

  console.log(`📰 Running: News Updates at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runNewsUpdates();
}, { timezone: "Asia/Kolkata" });




