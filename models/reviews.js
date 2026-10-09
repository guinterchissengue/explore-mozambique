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

router.route('/')
  .get(getReviews)
  .post(validateReview, createReview);

router.route('/:id')
  .get(getReviewById)
  .put(validateReview, updateReview)
  .delete(deleteReview);

module.exports = router;