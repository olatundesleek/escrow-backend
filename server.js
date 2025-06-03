const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const { initSocket } = require("./sockets/socket"); // Import the socket initialization function

// Load environment variables based on the current NODE_ENV (default: development)
const server = http.createServer(app); // Create an HTTP server using Express

initSocket(server); // Initialize socket.io with the server

if (process.env.NODE_ENV !== "production") {
  const envFile = `.env.${process.env.NODE_ENV || "development"}`;
  require("dotenv").config({ path: envFile });
}

// const userSocketMap = new Map(); // userId -> socket.id

// MailDev setup for testing emails
if (process.env.NODE_ENV !== "production") {
  const MailDev = require("maildev");

  const maildev = new MailDev({
    smtp: 1025, // Local SMTP server
    web: 1080, // Web UI for viewing emails
  });

  maildev.listen(() => {
    console.log("MailDev is running on http://localhost:1080");
  });
}
const PORT = process.env.PORT || 3000;
// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on ports ${PORT}`);
});
