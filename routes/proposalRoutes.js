import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createProposal,
  getProposalsByProject,
  acceptProposal,
} from "../controllers/proposalController.js";

const router = express.Router();

// Freelancer submits proposal
router.post("/", protect, createProposal);

// Client views proposals of a project
router.get("/:projectId", protect, getProposalsByProject);

// Client accepts proposal
router.put("/accept/:id", protect, acceptProposal);

export default router;