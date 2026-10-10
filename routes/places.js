const express = require('express');
const router = express.Router();

const {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
} = require('../controllers/placesController');

const { validatePlace } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');

router.route('/')
  .get(getPlaces)
  .post(requireAuth, validatePlace, createPlace);

router.route('/:id')
  .get(getPlaceById)
  .put(requireAuth, validatePlace, updatePlace)
  .delete(requireAuth, deletePlace);

module.exports = router;