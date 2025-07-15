const cron = require("node-cron");
const { predictStocks: predictStocksPre } = require("../controllers/predictController");
const { predictStocks: predictStocksIn } = require("../controllers/predictControllerIn");
const { validatepredictStocks: validatepredictStocksPre } = require("../controllers/validatepredictController");
const { validatepredictStocks: validatepredictStocksIn} = require("../controllers/validatepredictInController");
const { predictStocks: DailyUpdates} = require("../controllers/DailyUpdatesController");
const { predictStocks: NewsUpdates} = require("../controllers/newsUpdatesController");
// Wrapper for validatepredictStocks


// Wrapper for Pre Market predictStocks
const runPredictStocks = async () => {
  try {
    await predictStocksPre(
      { app: { get: () => null } },
      {
        json: (data) => console.log("Cron (predictStocksPre) success:", data),
        status: (code) => ({
          json: (err) => console.error("Cron (predictStocksPre) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("Cron (predictStocksPre) failed:", err.message);
  }
};

// Wrapper for Intra Day predictStocks
const runPredictStocksIn = async () => {
  try {
    await predictStocksIn(
      { app: { get: () => null } },
      {
        json: (data) => console.log("Cron (predictStocksIn) success:", data),
        status: (code) => ({
          json: (err) => console.error("Cron (predictStocksIn) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("Cron (predictStocksIn) failed:", err.message);
  }
};
const runValidatePredict = async () => {
  try {
    await validatepredictStocksPre(
      { app: { get: () => null } },
      {
        json: (data) => console.log("Cron (validatepredictStocks) success:", data),
        status: (code) => ({
          json: (err) => console.error("Cron (validatepredictStocks) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("Cron (validatepredictStocks) failed:", err.message);
  }
};

const runValidatePredictIn = async () => {
  try {
    await validatepredictStocksIn(
      { app: { get: () => null } },
      {
        json: (data) => console.log("✅ Cron (validatepredictStocks) success:", data),
        status: (code) => ({
          json: (err) => console.error("Cron (validatepredictStocks) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("Cron (validatepredictStocks) failed:", err.message);
  }
};
// ⏰ Schedules
const runDailyUpdates = async () => {
  try {
    await DailyUpdates(
      { app: { get: () => null } },
      {
        json: (data) => console.log("Cron (validatepredictStocks) success:", data),
        status: (code) => ({
          json: (err) => console.error("Cron (validatepredictStocks) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("Cron (validatepredictStocks) failed:", err.message);
  }
};

const runNewsUpdates = async () => {
  try {
    await NewsUpdates(
      { app: { get: () => null } },
      {
        json: (data) => console.log("Cron (validatepredictStocks) success:", data),
        status: (code) => ({
          json: (err) => console.error("Cron (validatepredictStocks) error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("Cron (validatepredictStocks) failed:", err.message);
  }
};
// validatepredictStocks at 9:20 AM
cron.schedule("20 9 * * *", () => {
  console.log("⏱️ Running cron job: validatepredictStocks (9:20 AM)");
  runValidatePredict();
});

// predictStocksPre at 8:15 AM
cron.schedule("30 8 * * *", () => {
  console.log("⏱️ Running cron job: predictStocksPre (8:15 AM)");
  runPredictStocks();
});

// predictStocksIn at 9:01 AM
cron.schedule("1 9-15/2 * * *", () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Block if it's past 15:30
  if (hour === 15 && minute > 30) {
    console.log("Skipping job: time is past 15:30");
    return;
  }

  console.log("⏱️ Running cron job: predictStocksIn (every 2 hours from 09:01 to 15:30)");
  runPredictStocksIn();
});


cron.schedule("40 10-16/2 * * *", () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Prevent execution if time is after 16:00
  if (hour === 16 && minute > 0) {
    console.log("Skipping cron job: after 16:00");
    return;
  }

  console.log("⏱️ Running cron job: validatePredictIn (every 2 hours from 10:40 to 16:00)");
  runValidatePredictIn();
});
cron.schedule("01 9 * * *", () => {
  console.log("⏱️ Running cron job: predictStocksIn (every hour at minute 1)");
  runDailyUpdates();
});
cron.schedule("1 * * * *", () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Check if time is after 15:30
  if (hour > 15 || (hour === 15 && minute > 30)) {
    console.log("Skipping cron job after 15:30");
    return;
  }
  console.log("Running cron job: predictStocksIn (every hour at minute 1)");
  runNewsUpdates();
});