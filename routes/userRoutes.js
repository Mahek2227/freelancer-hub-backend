import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getUserById,
  getProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
  upload,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/avatar", protect, upload.single("file"), uploadAvatar);
router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUserById);

export default router;
