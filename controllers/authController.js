const Joi = require("joi");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  sendUserRegisterationEmail,
  sendPasswordResetEmail,
} = require("../Email/email");

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

const emailVerificationSchema = Joi.object({
  email: Joi.string().required(),
});
const passwordResetSchema = Joi.object({
  email: Joi.string().required(),
});

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  const { error } = emailVerificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email }).select("username email status");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    await sendVerificationEmail(user);

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
    });
  }
};

// Send email verification
const sendVerificationEmail = async (user) => {
  try {
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    await sendUserRegisterationEmail(user.username, user.email, token);
  } catch (err) {
    // Silently fail email sending, or handle via logging/monitoring
  }
};

// Send password reset email

async function resetPassword(req, res) {
  const { error } = emailVerificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }

  const userEmail = req.body.email;

  if (!userEmail) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email: userEmail }).select(
      "firstname email firstname"
    );

    if (user) {
      const token = jwt.sign(
        { email: user.email },
        process.env.PASSWORD_RESET_SECRET,
        {
          expiresIn: "5m",
        }
      );

      await sendPasswordResetEmail(token, user.firstname, user.email);
    }

    return res.status(200).json({
      success: true,
      message: `If an account with ${userEmail} exists, you will receive a password reset email.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
}

// Register a new user
const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }

  const { firstname, lastname, username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      status: "inactive",
    });

    await sendVerificationEmail(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Verification email sent.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

// Login a user
const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active. Please verify your email.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to log in",
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    user.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  sendVerificationEmail,
  resendVerificationEmail,
  resetPassword,
};
