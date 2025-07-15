const cron = require("node-cron");
process.env.TZ = "Asia/Kolkata"; // Set server-side timezone globally

const { predictStocks: predictStocksPre } = require("../controllers/predictController");
const { predictStocks: predictStocksIn } = require("../controllers/predictControllerIn");
const { validatepredictStocks: validatepredictStocksPre } = require("../controllers/validatepredictController");
const { validatepredictStocks: validatepredictStocksIn } = require("../controllers/validatepredictInController");
const { predictStocks: DailyUpdates } = require("../controllers/DailyUpdatesController");
const { predictStocks: NewsUpdates } = require("../controllers/newsUpdatesController");

// Predict Stocks (Pre Market)
const runPredictStocks = async () => {
  try {
    await predictStocksPre(
      { app: { get: () => null } },
      {
        json: (data) => console.log("✅ Cron (predictStocksPre) success:", data),
        status: (code) => ({
          json: (err) => console.error("❌ Cron (predictStocksPre) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("❌ Cron (predictStocksPre) failed:", err.message);
  }
};

// Predict Stocks (Intra Day)
const runPredictStocksIn = async () => {
  try {
    await predictStocksIn(
      { app: { get: () => null } },
      {
        json: (data) => console.log("✅ Cron (predictStocksIn) success:", data),
        status: (code) => ({
          json: (err) => console.error("❌ Cron (predictStocksIn) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("❌ Cron (predictStocksIn) failed:", err.message);
  }
};

// Validate Pre Market
const runValidatePredict = async () => {
  try {
    await validatepredictStocksPre(
      { app: { get: () => null } },
      {
        json: (data) => console.log("✅ Cron (validatepredictStocksPre) success:", data),
        status: (code) => ({
          json: (err) => console.error("❌ Cron (validatepredictStocksPre) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("❌ Cron (validatepredictStocksPre) failed:", err.message);
  }
};

// Validate Intra Day
const runValidatePredictIn = async () => {
  try {
    await validatepredictStocksIn(
      { app: { get: () => null } },
      {
        json: (data) => console.log("✅ Cron (validatepredictStocksIn) success:", data),
        status: (code) => ({
          json: (err) => console.error("❌ Cron (validatepredictStocksIn) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("❌ Cron (validatepredictStocksIn) failed:", err.message);
  }
};

// Daily Updates
const runDailyUpdates = async () => {
  try {
    await DailyUpdates(
      { app: { get: () => null } },
      {
        json: (data) => console.log("✅ Cron (DailyUpdates) success:", data),
        status: (code) => ({
          json: (err) => console.error("❌ Cron (DailyUpdates) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("❌ Cron (DailyUpdates) failed:", err.message);
  }
};

// News Updates
const runNewsUpdates = async () => {
  try {
    await NewsUpdates(
      { app: { get: () => null } },
      {
        json: (data) => console.log("✅ Cron (NewsUpdates) success:", data),
        status: (code) => ({
          json: (err) => console.error("❌ Cron (NewsUpdates) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("❌ Cron (NewsUpdates) failed:", err.message);
  }
};

//
// CRON JOBS (All in Asia/Kolkata timezone)
//

// 🔁 validatepredictStocks at 9:20 AM IST
cron.schedule("20 9 * * *", () => {
  console.log("⏱️ Cron: validatepredictStocksPre (9:20 AM)");
  runValidatePredict();
}, { timezone: "Asia/Kolkata" });

// 🔁 predictStocksPre at 8:30 AM IST
cron.schedule("30 8 * * *", () => {
  console.log("⏱️ Cron: predictStocksPre (8:30 AM)");
  runPredictStocks();
}, { timezone: "Asia/Kolkata" });

// 🔁 predictStocksIn - Every 2 hours from 09:01 to 15:30
// cron.schedule("1 14-15/1 * * *", () => {
//   const now = new Date();
//   const hour = now.getHours();
//   const minute = now.getMinutes();

//   if (hour === 15 && minute > 30) {
//     console.log("⏭️ Skipping predictStocksIn: past 15:30");
//     return;
//   }

//   console.log("⏱️ Cron: predictStocksIn (every 2 hours from 1:01 PM to 3:01 PM)");
//   runPredictStocksIn();
// }, { timezone: "Asia/Kolkata" });

cron.schedule("*/5 * * * *", () => {
  const now = new Date();
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const hour = indiaTime.getHours();
  const minute = indiaTime.getMinutes();

  // Stop execution after 6:00 PM IST
  if (hour >= 18) {
    console.log("⛔ Skipping cron: past 6:00 PM IST");
    return;
  }

  console.log(`⏱️ Running Cron (IST): ${indiaTime.toLocaleTimeString("en-IN", { hour12: true })}`);
  runPredictStocksIn();
}, { timezone: "Asia/Kolkata" });

// 🔁 validatePredictIn - Every 2 hours from 10:40 to 16:00
cron.schedule("40 10-16/2 * * *", () => {
  const now = new Date();
  if (now.getHours() === 16 && now.getMinutes() > 0) {
    console.log("⏭️ Skipping validatePredictIn: after 16:00");
    return;
  }

  console.log("⏱️ Cron: validatePredictIn (10:40 AM to 4:00 PM every 2 hrs)");
  runValidatePredictIn();
}, { timezone: "Asia/Kolkata" });

// 🔁 DailyUpdates at 09:01 AM
cron.schedule("1 9 * * *", () => {
  console.log("⏱️ Cron: DailyUpdates (09:01 AM)");
  runDailyUpdates();
}, { timezone: "Asia/Kolkata" });

// 🔁 NewsUpdates - Every hour at minute 1, until 15:30
cron.schedule("1 * * * *", () => {
  const now = new Date();
  if (now.getHours() > 15 || (now.getHours() === 15 && now.getMinutes() > 30)) {
    console.log("⏭️ Skipping NewsUpdates: after 15:30");
    return;
  }

  console.log("⏱️ Cron: NewsUpdates (every hour until 15:30)");
  runNewsUpdates();
}, { timezone: "Asia/Kolkata" });
