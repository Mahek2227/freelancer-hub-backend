import mongoose from "mongoose";

// Define Review schema if it doesn't exist
const reviewSchema = new mongoose.Schema(
  {
    ratedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export const createReview = async (req, res) => {
  try {
    const { ratedUser, rating, review, projectId } = req.body;

    if (!rating || !review) {
      return res.status(400).json({ message: "Rating and review are required" });
    }

    const newReview = await Review.create({
      ratedUser,
      reviewer: req.user._id,
      project: projectId,
      rating,
      review,
    });

    // Update user's average rating
    const reviews = await Review.find({ ratedUser });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const User = mongoose.model("User");
    await User.findByIdAndUpdate(ratedUser, {
      average_rating: avgRating,
      total_reviews: reviews.length,
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ ratedUser: req.params.userId })
      .populate("reviewer", "name profile_picture_url email")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewByProject = async (req, res) => {
  try {
    const review = await Review.findOne({
      project: req.params.projectId,
      reviewer: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only reviewer can update
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this review" });
    }

    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.review) review.review = req.body.review;

    await review.save();

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only reviewer can delete
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
