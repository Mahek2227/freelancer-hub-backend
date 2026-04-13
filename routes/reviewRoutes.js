import express from "express";
import protect from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import {
  createReview,
  getReviewsByUser,
  getReviewByProject,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/user/:userId", protect, getReviewsByUser);
router.get("/project/:projectId", protect, getReviewByProject);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
