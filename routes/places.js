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

router.route('/')
  .get(getPlaces)
  .post(validatePlace, createPlace);

router.route('/:id')
  .get(getPlaceById)
  .put(validatePlace, updatePlace)
  .delete(deletePlace);

module.exports = router;