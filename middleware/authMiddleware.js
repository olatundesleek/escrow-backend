// const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/User");
const { verifySignInToken } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.reqtoken;

  if (!token) {
    return res
      .status(403)
      .json({ message: "No token provided", authenticated: false });
  }

  const decoded = verifySignInToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  req.userId = decoded.id;
  req.subRole = decoded.subRole;
  req.role = decoded.role;

  next();
};

const isAdmin = (req, res, next) => {
  User.findById(req.userId, (err, user) => {
    if (err || !user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user.role !== "admin") {
      return res.status(403).send({ message: "Require Admin Role!" });
    }

    next();
  });
};

const verifySocketToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token)
      return next(new Error("Authentication error: no token provided"));

    const decoded = await verifySignInToken(token); // Make sure this is async or throws
    if (!decoded || !decoded.id)
      return next(new Error("Invalid or expired token"));

    const user = await User.findById(decoded.id);
    if (!user) return next(new Error("User not found"));

    socket.userId = user._id.toString();
    socket.username = user.username;
    socket.role = user.role;

    next(); // pass the socket through
  } catch (err) {
    console.error("Socket authentication failed:", err.message || err);
    next(new Error("Authentication error"));
  }
};

module.exports = {
  authMiddleware,
  isAdmin,
  verifySocketToken,
};
