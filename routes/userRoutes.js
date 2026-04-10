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

// Avatar upload route - with proper error handling for multer
router.post("/avatar", protect, (req, res, next) => {
  console.log('Avatar route hit');
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    console.log('Multer passed, calling uploadAvatar');
    next();
  });
}, uploadAvatar);

router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUserById);

export default router;
