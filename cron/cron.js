const cron = require("node-cron");
const { predictStocks: predictStocksPre } = require("../controllers/predictController");
const { predictStocks: predictStocksIn } = require("../controllers/predictControllerIn");
const { validatepredictStocks: validatepredictStocksPre } = require("../controllers/validatepredictController");
const { validatepredictStocks: validatepredictStocksIn } = require("../controllers/validatepredictInController");
const { predictStocks: DailyUpdates } = require("../controllers/DailyUpdatesController");
const { predictStocks: NewsUpdates } = require("../controllers/newsUpdatesController");
const isMarketHoliday = require("../utils/isMarketHoliday");

const mockRes = {
  json: (data) => console.log("✅ Cron success:", data),
  status: (code) => ({
    json: (err) => console.error(`❌ Cron failed [${code}]:`, err),
  }),
};

const reqMock = {};

// --- Cron Wrappers ---
const runPredictStocksPre = () => predictStocksPre(reqMock, mockRes);
const runPredictStocksIn = () => predictStocksIn(reqMock, mockRes);
const runValidatePredictPre = () => validatepredictStocksPre(reqMock, mockRes);
const runValidatePredictIn = () => validatepredictStocksIn(reqMock, mockRes);
const runDailyUpdates = () => DailyUpdates(reqMock, mockRes);
const runNewsUpdates = () => NewsUpdates(reqMock, mockRes);

// --- Cron Schedules ---

// 🕗 Pre-Market Prediction — 8:20 AM (Mon–Fri)
cron.schedule("20 8 * * 1-5", () => {
  if (isMarketHoliday()) return console.log("📛 Skipping Pre-Market Prediction: Market Holiday");
  console.log("⏱️ Running: Pre-Market Prediction (8:20 AM)");
  runPredictStocksPre();
}, { timezone: "Asia/Kolkata" });

// 🔄 Intra-Day Predictions — 9:15, 11:15, 1:15, 3:15 (Mon–Fri)
cron.schedule("15 9,11,13,15 * * 1-5", () => {
  if (isMarketHoliday()) return console.log("📛 Skipping Intra-Day Prediction: Market Holiday");
  const indiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  console.log(`⏱️ Running: Intra-Day Prediction at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runPredictStocksIn();
}, { timezone: "Asia/Kolkata" });

// ✅ Intra-Day Pre Validation — 10:50 AM (Mon–Fri)
cron.schedule("20 9 * * 1-5", () => {
  if (isMarketHoliday()) return console.log("📛 Skipping Intra-Day Validation (Pre): Market Holiday");
  const indiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  console.log(`⏱️ Running: Intra-Day Validation at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runValidatePredictPre();
}, { timezone: "Asia/Kolkata" });

// ✅ Intra-Day Post Validation — 3:40 PM (Mon–Fri)
cron.schedule("40 15 * * 1-5", () => {
  if (isMarketHoliday()) return console.log("📛 Skipping Intra-Day Validation (Post): Market Holiday");
  const indiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  console.log(`⏱️ Running: Intra-Day Validation at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runValidatePredictIn();
}, { timezone: "Asia/Kolkata" });

// 📆 Daily Updates — 9:01 AM (Mon–Fri)
let hasRunToday = false;
cron.schedule("1 9 * * 1-5", () => {
  if (hasRunToday || isMarketHoliday()) {
    console.log("📛 Skipping Daily Updates: Already Run or Market Holiday");
    return;
  }
  console.log("⏱️ Running: Daily Updates (9:01 AM)");
  runDailyUpdates();
  hasRunToday = true;
}, { timezone: "Asia/Kolkata" });

// 🔄 Reset daily flag at midnight
cron.schedule("0 0 * * *", () => {
  hasRunToday = false;
}, { timezone: "Asia/Kolkata" });

// 📰 News Updates — Every hour at :15 (9:15 AM – 3:15 PM, Mon–Fri)
cron.schedule("0 7-15 * * 1-5", () => {
  const now = new Date();
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const hour = indiaTime.getHours();
  const minute = indiaTime.getMinutes();

  // Check if it's a market holiday
  if (isMarketHoliday()) {
    console.log("⛔ Skipping: Market Holiday");
    return;
  }

  console.log(`📰 Running: News Updates at ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runNewsUpdates();
}, { timezone: "Asia/Kolkata" });

