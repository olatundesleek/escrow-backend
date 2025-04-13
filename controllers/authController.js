const Joi = require("joi");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendUserRegisterationEmail } = require("../Email/email");

// Joi schemas
const registerSchema = Joi.object({
  firstname: Joi.string().min(3).max(30).required(),
  lastname: Joi.string().min(3).max(30).required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const sendVerificationEmail = async (user) => {
  const token = await jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
  sendUserRegisterationEmail(user.username, user.email, token);

  console.log(token);

  // const verificationUrl = `${process.env.WEBLINK}/verify-email/${token}`;
  // Send email logic here using a mail service
  // console.log(`Verification URL: ${verificationUrl}`);
};

// Register a new user
const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }

  const { firstname, lastname, username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      status: "inactive", //  setting account status
    });
    sendVerificationEmail(newUser); // Send verification email
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Login a user
const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" }); // 👈 Check for active status
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 3600000,
    });
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("this is the decoded token", decoded);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "active"; // Update the user's status to active
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email", error });
  }
};

// Logout user
const logout = (req, res) => {
  res.clearCookie("token"); // Remove the authentication cookie
  res.json({ message: "Logged out successfully!" });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  sendVerificationEmail,
};
