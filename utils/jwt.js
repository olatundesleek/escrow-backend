const jwt = require("jsonwebtoken");

const signInToken = (payload, expiresIn) => {
  return jwt.sign(
    payload,
    process.env.JWT_SIGNIN_SECRET.replace(/\\n/g, "\n"),
    { algorithm: "RS256", expiresIn: expiresIn }
  );
};

const verifySignInToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SIGNIN_SECRET.replace(/\\n/g, "\n"),
      { algorithms: ["RS256"] }
    );
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = { signInToken, verifySignInToken };
