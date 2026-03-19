import Deliverable from "../models/Deliverable.js";
import Project from "../models/Project.js";

export const submitDeliverable = async (req, res) => {
  try {
    const { projectId, message, fileUrl } = req.body;

    const deliverable = await Deliverable.create({
      project: projectId,
      freelancer: req.user._id,
      message,
      fileUrl,
    });

    res.status(201).json(deliverable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDeliverables = async (req, res) => {
  const data = await Deliverable.find({
    project: req.params.projectId,
  }).populate("freelancer", "name email");

  res.json(data);
};

export const approveDeliverable = async (req, res) => {
  const deliverable = await Deliverable.findById(req.params.id);

  deliverable.status = "approved";
  await deliverable.save();

  // also mark project complete
  const project = await Project.findById(deliverable.project);
  project.status = "completed";
  await project.save();

  res.json({ message: "Approved" });
};