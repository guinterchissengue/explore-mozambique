const express = require('express');
const router = express.Router();

const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewsController');

const { validateReview } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');

router.route('/')
  .get(getReviews)
  .post(requireAuth, validateReview, createReview);

router.route('/:id')
  .get(getReviewById)
  .put(requireAuth, validateReview, updateReview)
  .delete(requireAuth, deleteReview);

module.exports = router;