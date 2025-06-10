// server.js (ENTRY POINT with Socket.IO integration)
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const app = require("./app");

// Connect to DB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Listen for socket connections
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// Attach io to app so it can be used in controllers
app.set("io", io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
