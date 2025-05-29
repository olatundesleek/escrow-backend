const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "https://escrow-rouge.vercel.app",
  "*.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.options("*", cors());

const cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes");
const escrowRoutes = require("./routes/escrowRoutes");
const profileRoutes = require("./routes/profileRoutes");
const siteRoutes = require("./routes/siteRoutes");
const adminRoutes = require("./routes/adminRoutes");
// const disputeRoutes = require('./routes/disputeRoutes');
// const authMiddleware = require('./middleware/authMiddleware');

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", escrowRoutes);
app.use("/api", profileRoutes);
app.use("/api", siteRoutes);
app.use("/api", adminRoutes);
// app.use("/api", profileRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/dispute', disputeRoutes);

module.exports = app;
