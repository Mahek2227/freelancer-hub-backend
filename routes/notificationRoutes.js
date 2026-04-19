import express from "express";
import protect from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// GET ALL
router.get("/", protect, async (req, res) => {
  const data = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(data);
});

// COUNT
router.get("/unread-count", protect, async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });
  res.json({ count });
});

// MARK READ
router.put("/mark-read", protect, async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id },
    { isRead: true }
  );
  res.json({ message: "done" });
});

export default router;