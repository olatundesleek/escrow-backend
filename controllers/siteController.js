const SiteSettings = require('../models/SiteSettings');
const joi = require('joi');




const siteSettingsValidationSchema = joi.object({
  siteName: joi.string().required(),
  siteLogo: joi.string().optional(),
  siteDescription: joi.string().required(),
  siteUrl: joi.string().uri().required(),
  siteEmail: joi.string().email().required(),
  sitePhone: joi.string().required(),
  siteAddress: joi.string().required(),
  socialMediaLinks: joi.object({
    facebook: joi.string().uri().optional(),
    twitter: joi.string().uri().optional(),
    instagram: joi.string().uri().optional(),
    linkedin: joi.string().uri().optional(),
    youtube: joi.string().uri().optional(),
    tiktok: joi.string().uri().optional(),
  }).optional(),
  siteColors: joi.object({
    primary: joi.string().pattern(/^#([0-9A-Fa-f]{3}){1,2}$/).optional(),
    primary_section: joi.string().pattern(/^#([0-9A-Fa-f]{3}){1,2}$/).optional(),
    secondary: joi.string().pattern(/^#([0-9A-Fa-f]{3}){1,2}$/).optional(),
    background: joi.string().pattern(/^#([0-9A-Fa-f]{3}){1,2}$/).optional(),
    text_color: joi.string().pattern(/^#([0-9A-Fa-f]{3}){1,2}$/).optional(),
  }).optional(),
  maintenanceMode: joi.object({
    enabled: joi.boolean().default(false),
    message: joi.string().default("The site is under maintenance. Please check back later."),
  }).optional(),
});


const getSiteSettings = async (req, res) => {
  try {
    // Fetch site settings from the database
    const settings = await SiteSettings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Site settings not found' });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching site settings', error });
  }
}

const updateSiteSettings = async (req, res) => {
  try {
    const updateddSettings = req.body;
    // Validate the request body against the schema
    const { error } = siteSettingsValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Update site settings in the database
    const updatedSettings = await SiteSettings.findOneAndUpdate({},{$set: updateddSettings }, {upsert:true, new: true });
    if (!updatedSettings) {
      return res.status(404).json({ message: 'Site settings not found' });
    }
    res.status(200).json({ message: 'Site settings updated successfully', updatedSettings });
  } catch (error) {
    res.status(500).json({
        message: "Error Updating site Settings",
        error: error.message || "Internal server error",
      } );
  }
}




const enableMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message } = req.body;
    const updatedSettings = await SiteSettings.findOneAndUpdate(
      {},
      { 'maintenanceMode.enabled': enabled, 'maintenanceMode.message': message },
      { new: true }
    );
    if (!updatedSettings) {
      return res.status(404).json({ message: 'Site settings not found' });
    }
    res.status(200).json({ message: 'Maintenance mode updated successfully', updatedSettings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating maintenance mode', error });
  }
}

module.exports = {
  getSiteSettings,
  updateSiteSettings,
  enableMaintenanceMode,
};