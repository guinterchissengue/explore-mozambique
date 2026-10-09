const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: [
          'beach',
          'national-park',
          'historical',
          'cultural',
          'island',
          'waterfall',
          'reserve',
          'museum',
          'monument',
          'other'
        ],
        message: '{VALUE} is not a supported place type'
      }
    },
    averageCost: {
      type: Number,
      required: [true, 'Average cost is required'],
      min: [0, 'Average cost must be greater than or equal to 0']
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be greater than 5'],
      default: 0
    },
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    openingHours: {
      type: String,
      trim: true,
      default: 'Open 24 hours'
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Place', placeSchema);