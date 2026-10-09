const Joi = require('joi');
const mongoose = require('mongoose');

const PLACE_TYPES = [
  'beach', 'national-park', 'historical', 'cultural', 'island',
  'waterfall', 'reserve', 'museum', 'monument', 'other'
];

const objectId = (value, helpers) =>
  mongoose.Types.ObjectId.isValid(value) && /^[0-9a-fA-F]{24}$/.test(value)
    ? value
    : helpers.message('placeId must be a valid MongoDB ObjectId');

// ---------- Place schema (used by POST and PUT) ----------
const placeSchema = Joi.object({
  name: Joi.string().trim().min(3).required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 3 characters',
    'any.required': 'Name is required'
  }),
  description: Joi.string().trim().min(10).required().messages({
    'string.base': 'Description must be a string',
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
    'any.required': 'Description is required'
  }),
  city: Joi.string().trim().required().messages({
    'string.base': 'City must be a string',
    'string.empty': 'City is required',
    'any.required': 'City is required'
  }),
  province: Joi.string().trim().required().messages({
    'string.base': 'Province must be a string',
    'string.empty': 'Province is required',
    'any.required': 'Province is required'
  }),
  type: Joi.string().valid(...PLACE_TYPES).required().messages({
    'any.only': `Type must be one of: ${PLACE_TYPES.join(', ')}`,
    'string.empty': 'Type is required',
    'any.required': 'Type is required'
  }),
  averageCost: Joi.number().min(0).required().messages({
    'number.base': 'Average cost must be a number',
    'number.min': 'Average cost must be greater than or equal to 0',
    'any.required': 'Average cost is required'
  }),
  rating: Joi.number().min(0).max(5).messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be between 0 and 5',
    'number.max': 'Rating must be between 0 and 5'
  }),
  latitude: Joi.number().min(-90).max(90).messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90'
  }),
  longitude: Joi.number().min(-180).max(180).messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180'
  }),
  openingHours: Joi.string().trim().allow('').messages({
    'string.base': 'Opening hours must be a string'
  }),
  featured: Joi.boolean().messages({
    'boolean.base': 'Featured must be true or false'
  })
});

// ---------- Review schema (used by POST and PUT) ----------
const reviewSchema = Joi.object({
  placeId: Joi.string().required().custom(objectId).messages({
    'string.base': 'placeId must be a valid MongoDB ObjectId',
    'string.empty': 'placeId is required',
    'any.required': 'placeId is required'
  }),
  visitorName: Joi.string().trim().min(2).required().messages({
    'string.base': 'Visitor name must be a string',
    'string.empty': 'Visitor name is required',
    'string.min': 'Visitor name must be at least 2 characters',
    'any.required': 'Visitor name is required'
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be between 1 and 5',
    'number.max': 'Rating must be between 1 and 5',
    'any.required': 'Rating is required'
  }),
  comment: Joi.string().trim().min(5).required().messages({
    'string.base': 'Comment must be a string',
    'string.empty': 'Comment is required',
    'string.min': 'Comment must be at least 5 characters',
    'any.required': 'Comment is required'
  }),
  visitDate: Joi.date().iso().messages({
    'date.base': 'Visit date must be a valid date',
    'date.format': 'Visit date must be a valid ISO date (e.g. 2026-05-20)'
  })
});

const buildValidator = (schema) => (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Request body must be a JSON object']
      });
    }
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // report every problem at once
      stripUnknown: true   // ignore fields that are not part of the model (e.g. _id, createdAt)
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => d.message)
      });
    }
    req.body = value; // sanitized body
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  validatePlace: buildValidator(placeSchema),
  validateReview: buildValidator(reviewSchema)
};
