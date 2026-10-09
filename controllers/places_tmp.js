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


// @desc    Get all places
// @route   GET /places
const getPlaces = async (req, res) => {
  try {
    const places = await Place.find({});
    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get single place
// @route   GET /places/:id
const getPlaceById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
    }

    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ success: false, message: "Place not found" });
    }

    res.status(200).json({ success: true, data: place });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Create new place
// @route   POST /places
const createPlace = async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json({
      success: true,
      message: "Place created successfully",
      data: place
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update place
// @route   PUT /places/:id
const updatePlace = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
    }

    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Returns the updated document
      runValidators: true // Forces Mongoose schema validation as a backup
    });

    if (!place) {
      return res.status(404).json({ success: false, message: "Place not found" });
    }

    res.status(200).json({
      success: true,
      message: "Place updated successfully",
      data: place
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete place
// @route   DELETE /places/:id
const deletePlace = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
    }

    const place = await Place.findByIdAndDelete(req.params.id);

    if (!place) {
      return res.status(404).json({ success: false, message: "Place not found" });
    }

    res.status(200).json({
      success: true,
      message: "Place deleted successfully"
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
};