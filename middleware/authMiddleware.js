// const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/User");
const { verifySignInToken } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.reqtoken;

  console.log("Token from cookies:", token);

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

//   process.env.JWT_SIGNIN_SECRET.replace(/\\n/g, "\n"),
//   { algorithms: ["RS256"] },
//   (err, decoded) => {
//     if (err) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }
//     req.userId = decoded.id;
//     req.subRole = decoded.subRole;
//     req.role = decoded.role;

//     next();
//   }
// );

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
  const rawCookies = socket.handshake.auth?.token;

  if (!rawCookies) return next(new Error("Authentication error,no token sent"));

  const ptoken = rawCookies; // Assuming the token is directly passed in auth field
  console.log("Parsed token from socket:", ptoken);
  try {
    const decoded = verifySignInToken(ptoken);
    if (!decoded) return next(new Error("Authentication error"));

    const user = await User.findById(decoded.id);
    if (!user) return next(new Error("Authentication error"));

    socket.userId = user._id.toString();
    socket.username = user.username;
    socket.role = user.role;
    next(); // success
  } catch (err) {
    next(new Error("Authentication error")); // fails safely
  }
};

module.exports = {
  authMiddleware,
  isAdmin,
  verifySocketToken,
};
