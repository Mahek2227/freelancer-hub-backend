import express from "express";
import protect from "../middleware/authMiddleware.js";
import multer from "multer";
import { saveToken } from "../controllers/userController.js";
import { sendNotification } from "../utils/sendNotification.js";
import User from "../models/User.js";

import {
  getUserById,
  getProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
  
} from "../controllers/userController.js";

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.get("/test-notification", protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  await sendNotification(
    user.fcmToken,
    "Test Notification",
    "It is working 🚀"
  );

  res.json({ message: "Notification sent" });
});
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/save-token", protect, saveToken);

// Avatar upload route - with proper error handling for multer
router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);
router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUserById);

export default router;
