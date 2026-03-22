import express from "express";
import {
  submitDeliverable,
  getDeliverables,
  approveDeliverable,
} from "../controllers/deliverableController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, submitDeliverable);
router.put("/approve/:id", protect, approveDeliverable);
router.get("/:projectId", protect, getDeliverables);

export default router;