const Joi = require("joi");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {
  sendUserRegisterationEmail,
  sendPasswordResetEmail,
} = require("../Email/email");
const { signInToken } = require("../utils/jwt");

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
  rememberme: Joi.boolean().optional(),
});

// schema for changing password
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "New password and confirmation do not match",
    }),
});

const emailVerificationSchema = Joi.object({
  email: Joi.string().required(),
});


const confirmResetTokenSchema = Joi.object({
  token: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
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

async function forgotPassword(req, res) {
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

// confirm reset token
const confirmResetToken = async (req, res) => {
  const { token } = req.params;
  const { error } = confirmResetTokenSchema.validate({ token });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);
    res.status(200).json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const resetPassword = async (req, res) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  const { token, password, confirmPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET)
;
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({
      success: false,
      message: "could not reset password",
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: "Email or username already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //Create user within the session
    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save({ session });

    // Create wallet linked to user within the session
    const newWallet = new Wallet({ user: newUser._id });
    await newWallet.save({ session });

    // Link wallet to user within the session
    newUser.wallet = newWallet._id;
    await newUser.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send verification email (outside transaction)
    await sendVerificationEmail(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Verification email sent.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction error:", error);
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

  const { username, password, rememberme } = req.body;

  try {
    console.log("rememberme:", rememberme);
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
        email: user.email,
      });
    }
    // Check if the user is banned

    if (user.status == "suspended") {
      return res.status(403).json({
        success: false,
        message: "Account is suspended. Please contact customer care.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const expiresIn = rememberme ? "5d" : "1h";
    let token;
    console.log(user.role);
    if (user.role === "user") {
      const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      token = signInToken(payload, expiresIn);
    } else {
      const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subRole: user.subRole,
      };
      token = signInToken(payload, expiresIn);
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("reqtoken", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production (requires HTTPS)
      sameSite: isProduction ? "none" : "lax", // "none" for cross-site in prod, "lax" to avoid rejection in dev
      maxAge: rememberme ? 5 * 24 * 60 * 60 * 1000 : 3600000, // 5 days or 1 hour in milliseconds
      path: "/", // Ensure it's sent on all routes
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
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
    const email = decoded.email;
    const user = await User.findOne({ email: email });
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
      email: email,
    });
  }
};

const changePassword = async (req, res) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;
  console.log("User ID:", userId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// Logout
const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("reqtoken", {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({
    success: true,
    message: "logged out successfully",
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
  forgotPassword,
  confirmResetToken,
  changePassword,
};
