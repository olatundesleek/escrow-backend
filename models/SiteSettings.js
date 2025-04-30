const mongoose = require("mongoose");

const siteSettingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
    },
    siteLogo: {
      type: String,
    },
    siteDescription: {
      type: String,
      required: true,
    },
    siteUrl: {
      type: String,
      required: true,
    },
    siteEmail: {
      type: String,
      required: true,
    },
    sitePhone: {
      type: String,
      required: true,
    },
    siteAddress: {
      type: String,
      required: true,
    },
    socialMediaLinks: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
      youtube: { type: String },
      tiktok: { type: String }
    },
    siteColors: {
      primary: { type: String, default: "#000000" },
      secondary: { type: String, default: "#9af039" },
      primary_section: { type: String, default: "#fafaff" },
      background: { type: String, default: "#ffffff" },
      text_color: { type: String, default: "#333333" }
    },
    termsAndConditions: {
      type: String,
    },
    privacyPolicy: {
      type: String,
    },
    contactFormEmail: {
      type: String,
    },
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: "The site is under maintenance. Please check back later." },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingSchema);
