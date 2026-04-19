import Deliverable from "../models/Deliverable.js";
import Project from "../models/Project.js";
import {notifyUser} from "../utils/notifyUser.js";

export const submitDeliverable = async (req, res) => {
  try {
    const { projectId, message, fileUrl } = req.body;

    const deliverable = await Deliverable.create({
      project: projectId,
      freelancer: req.user._id,
      message,
      fileUrl,
    });
    // 🔔 Notify client
const project = await Project.findById(projectId);

await notifyUser(
  project.client,
  "New Deliverable 📦",
  "A freelancer submitted work for your project"
);
    res.status(201).json(deliverable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDeliverables = async (req, res) => {
  try {
    const data = await Deliverable.find({
      project: req.params.projectId,
    }).populate("freelancer", "name email");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveDeliverable = async (req, res) => {
  try {
    const deliverable = await Deliverable.findById(req.params.id);

    if (!deliverable) {
      return res.status(404).json({ message: "Deliverable not found" });
    }

    deliverable.status = "approved";
    await deliverable.save();

    // mark project completed
    const project = await Project.findById(deliverable.project);
    project.status = "completed";
    await project.save();

    // 🔔 Notify freelancer
    await notifyUser(
      deliverable.freelancer,
      "Deliverable Approved ✅",
      "Your work has been approved by the client"
    );

    res.json({ message: "Approved" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};