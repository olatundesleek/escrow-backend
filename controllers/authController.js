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
      token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SIGNIN_SECRET.replace(/\\n/g, "\n"),
        { algorithm: "RS256", expiresIn: expiresIn }
      );
    } else {
      token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          subRole: user.subRole,
        },
        process.env.JWT_SIGNIN_SECRET.replace(/\\n/g, "\n"),
        { algorithm: "RS256", expiresIn: expiresIn }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production (requires HTTPS)
      sameSite: isProduction ? "none" : "lax", // "none" for cross-site in prod, "lax" to avoid rejection in dev
      maxAge: 3600000, // 1 hour in milliseconds
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

// Logout
const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
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
};
