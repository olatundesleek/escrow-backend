const nodemailer = require("nodemailer");
const generateUserRegisterationEmail = require("./templates/userregisteration");
const generateCreateEscrowEmail = require("./templates/newescrowcreated");
const generateCounterpartyEscrowEmail = require("./templates/escrowtransaction");
const generatePasswordResetEmail = require("./templates/passwordreset");

// const generatePasswordchangedEmail = require("../emailtemplate/passwordchanged");

const isProduction = process.env.NODE_ENV === "production";

// Disable TLS rejection only in development mode
if (!isProduction) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Create email transporter dynamically
const transporter = isProduction
  ? nodemailer.createTransport({
      host: "smtp.mailersend.net",
      secure: false,
      port: 587,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    })
  : nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
    });

async function sendPasswordResetEmail(token, firstname, email) {
  try {
    const subject = "Password-Reset";
    const html = generatePasswordResetEmail(firstname, token);
    await transporter.sendMail({
      from: process.env.EMAIL, // Sender email (set in env)
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}

async function sendPasswordChangedEmail(user, email) {
  try {
    const subject = "Password-Change";
    const html = generatePasswordchangedEmail(user);
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending password changed email:", error);
  }
}

async function sendUserRegisterationEmail(username, email, token) {
  try {
    const subject = "Welcome to Naija Escrow";
    const html = generateUserRegisterationEmail(username, token);
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending user registration email:", error);
  }
}

async function sendCreateEscrowEmail(
  creatorFirstName,
  escrowId,
  amount,
  createdAt,
  creatorRole,
  counterpartyEmail,
  description
) {
  try {
    const subject = "Escrow Created";
    const html = generateCreateEscrowEmail(
      creatorFirstName,
      escrowId,
      amount,
      createdAt,
      creatorRole,
      description
    );
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: counterpartyEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending escrow creation email:", error);
  }
}

async function sendReceiveEscrowEmail(
  creatorFirstName,
  counterpartyFirstName,
  escrowId,
  amount,
  createdAt,
  creatorRole,
  description,
  terms,
  counterpartyEmail
) {
  try {
    const subject = "New Escrow Transaction Received";
    const html = generateCounterpartyEscrowEmail(
      creatorFirstName,
      counterpartyFirstName,
      escrowId,
      amount,
      createdAt,
      creatorRole,
      description,
      terms
    );
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: counterpartyEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending escrow Counterparty Escrow email:", error);
  }
}

module.exports = {
  sendCreateEscrowEmail,
  sendPasswordResetEmail,
  sendUserRegisterationEmail,
  sendReceiveEscrowEmail,
  //   sendPasswordChangedEmail,
};
