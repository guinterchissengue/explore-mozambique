const Review = require('../models/Review');
const Place = require('../models/Place');

// Helper to check valid ObjectId
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// Maps database errors to the right HTTP status (400 for bad data, 500 otherwise)
const handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((e) => e.message)
    });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ObjectId format' });
  }
  console.error('Database/server error:', error.message);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};


// @desc    Get all reviews
// @route   GET /reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).populate('placeId', 'name city');
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get single review
// @route   GET /reviews/:id
const getReviewById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
    }

    const review = await Review.findById(req.params.id).populate('placeId', 'name');
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Create new review
// @route   POST /reviews
const createReview = async (req, res) => {
  try {
    // Rubric requirement: referenced place must exist
    const placeExists = await Place.findById(req.body.placeId);
    if (!placeExists) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: ["Referenced place does not exist"]
      });
    }

    const review = await Review.create(req.body);
    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update review
// @route   PUT /reviews/:id
const updateReview = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
    }

    // If they are trying to update the placeId, check if the new place exists
    {
      const placeExists = await Place.findById(req.body.placeId);
      if (!placeExists) {
        return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: ["Referenced place does not exist"]
      });
      }
    }

    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete review
// @route   DELETE /reviews/:id
const deleteReview = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
    }

    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview
};