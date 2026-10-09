const Joi = require('joi');
const mongoose = require('mongoose');

// Place Validation Schema
const placeSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.min': 'Name must be at least 3 characters',
    'any.required': 'Name is required'
  }),
  description: Joi.string().min(10).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'any.required': 'Description is required'
  }),
  city: Joi.string().required(),
  province: Joi.string().required(),
  type: Joi.string().valid(
    'beach', 'national-park', 'historical', 'cultural', 'island', 
    'waterfall', 'reserve', 'museum', 'monument', 'other'
  ).required().messages({
    'any.only': 'Type must be a valid accepted value (e.g., beach, national-park)'
  }),
  averageCost: Joi.number().min(0).required(),
  rating: Joi.number().min(0).max(5).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  openingHours: Joi.string().optional(),
  featured: Joi.boolean().optional()
});

// Review Validation Schema
const reviewSchema = Joi.object({
  placeId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message('placeId must be a valid MongoDB ObjectId');
    }
    return value;
  }).required(),
  visitorName: Joi.string().min(2).required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(5).required()
});

// Middleware for Place
const validatePlace = (req, res, next) => {
  const { error } = placeSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map(err => err.message)
    });
  }
  next();
};

// Middleware for Review
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map(err => err.message)
    });
  }
  next();
};

module.exports = { validatePlace, validateReview };