const SiteSettings = require("../models/SiteSettings");
const joi = require("joi");
const cloudinary = require("../config/cloudinary");
const { upload } = require("../middleware/upload");
const { Readable } = require("stream");
const siteSettingsValidationSchema = joi.object({
  siteName: joi.string().required(),
  siteLogo: joi.string().empty("").optional(),
  siteDescription: joi.string().optional(),
  siteUrl: joi.string().uri().optional(),
  siteEmail: joi.string().email().optional(),
  sitePhone: joi.string().optional(),
  siteAddress: joi.string().optional(),
  socialMediaLinks: joi
    .object({
      facebook: joi.string().uri().optional(),
      twitter: joi.string().uri().optional(),
      instagram: joi.string().uri().optional(),
      linkedin: joi.string().uri().optional(),
      youtube: joi.string().uri().optional(),
      tiktok: joi.string().uri().optional(),
    })
    .optional(),
  siteColors: joi
    .object({
      primary: joi
        .string()
        .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
        .optional(),
      primary_section: joi
        .string()
        .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
        .optional(),
      secondary: joi
        .string()
        .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
        .optional(),
      background: joi
        .string()
        .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
        .optional(),
      text_color: joi
        .string()
        .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
        .optional(),
    })
    .optional(),
});

const maintenanceModeValidationSchema = joi.object({
  enabled: joi.boolean().required(),
  message: joi.string().optional(),
});

const getSiteSettings = async (req, res) => {
  try {
    // Fetch site settings from the database
    const settings = await SiteSettings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Site settings not found" });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching site settings", error });
  }
};

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "escrow_site",
        public_id: `site_logo`,
        allowed_formats: ["jpg", "jpeg", "png", "gif"],
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
        ],
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
}

const updateSiteSettings = async (req, res) => {
  try {
    let updatedSettings = req.body;

    if (req.file) {
      // Await the upload promise
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      updatedSettings.siteLogo = uploadResult.secure_url;
    }

    // Validate input
    const { error } = siteSettingsValidationSchema.validate(updatedSettings);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const result = await SiteSettings.findOneAndUpdate(
      {},
      { $set: updatedSettings },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Site settings updated successfully",
      updatedSettings: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating site settings",
      error: error.message || "Internal server error",
    });
  }
};
const maintenanceMode = async (req, res) => {
  try {
    const { error } = maintenanceModeValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedSettings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: { maintenanceMode: req.body } },
      { new: true }
    );
    if (!updatedSettings) {
      return res.status(404).json({ message: "Site settings not found" });
    }
    res.status(200).json({
      message: "Maintenance mode updated successfully",
      maintenanceMode: updatedSettings.maintenanceMode,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating maintenance mode", error });
  }
};

module.exports = {
  getSiteSettings,
  updateSiteSettings,
  maintenanceMode,
};
