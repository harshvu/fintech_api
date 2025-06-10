// server.js (ENTRY POINT with Socket.IO and improved error handling)

const http = require("http");
const socketIo = require("socket.io");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = require("./app");

// Enable CORS for Express (important!)
app.use(cors({
  origin: "*", // replace with frontend URL in production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Start DB connection
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // Create HTTP server
    const server = http.createServer(app);

    // Attach Socket.IO with CORS
    const io = socketIo(server, {
      cors: {
        origin: "*", // Replace * with frontend IP in production
        methods: ["GET", "POST"]
      }
    });

    // Attach io to app
    app.set("io", io);

    // Handle socket connections
    io.on("connection", (socket) => {
      console.log("✅ A user connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ A user disconnected:", socket.id);
      });
    });

    // Start the server on 0.0.0.0 to expose it externally
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://147.93.27.17:${PORT}`);
    });

  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1); // Prevent container from hanging silently
  });

// Global error catchers
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});
