import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Conversations
router.get("/conversations", protect, getConversations);
router.post("/conversations", protect, getOrCreateConversation);

// Messages
router.get("/:conversationId", protect, getMessages);
router.post("/", protect, sendMessage);
router.put("/:conversationId/read", protect, markAsRead);
router.delete("/:messageId", protect, deleteMessage);

export default router;
