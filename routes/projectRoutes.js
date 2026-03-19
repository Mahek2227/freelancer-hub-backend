import express from "express";
import protect from "../middleware/authMiddleware.js";

import { 
  createProject,
  completeProject, 
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.put("/:id/complete", protect, completeProject);
router.delete("/:id", protect, deleteProject);

export default router;
