const cron = require("node-cron");
const { validatepredictStocks } = require("../controllers/validatepredictController");

// test//Wrapper to simulate req, res for internal call
const runValidatePredict = async () => {
  try {
    await validatepredictStocks(
      { app: { get: () => null } }, // mock req with minimal app for socket
      {
        json: (data) => console.log("✅ Cron prediction success:", data),
        status: (code) => ({
          json: (err) => console.error("❌ Cron error:", err),
        }),
      }
    );
  } catch (err) {
    console.error("❌ Cron failed:", err.message);
  }
};

// Schedule to run every minute
cron.schedule("* * * * *", () => {
  console.log("⏱️ Running cron job: validatepredictStocks");
  runValidatePredict();
});
