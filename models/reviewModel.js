const mongoose = require('mongoose');
const Tour = require('./tourModel');
//const handlerFactory = require('../controllers/handlerFactory');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // virtuals shows properties in output, properties that are not stored in a database, these properties are defined below
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
//So this entire function here to basically create the statistics of the average and number of ratings for the tour ID for which the current review was created, okay. And we created this function as a static method, because we needed to call the aggregate functionon the model. So in a static method to this variable calls exactly to a method.
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //So we constructed our aggregation pipeline here where we selected all the reviews that matched the current tour ID, and then they're calculated, the statistics for all of these reviews.
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //console.log(stats);

  // Then after that was done we saved the statistics to the current tour
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Then in order to actually use this function we call it after a new review has been created, okay. For that we need to use this.constructor because this is what points to the current model.
reviewSchema.post('save', function () {
  // this points to the current review
  this.constructor.calcAverageRatings(this.tour);
});

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   next();
// });

reviewSchema.post(/^findOneAnd/, async (doc) => {
  // await this.findOne(); does NOT work here, query has already executed
  await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
