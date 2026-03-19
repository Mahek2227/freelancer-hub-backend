import Proposal from "../models/Proposal.js";
import Project from "../models/Project.js";

// Freelancer submits proposal
export const createProposal = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can bid" });
    }

    const { projectId, coverLetter, bidAmount } = req.body;

    const project = await Project.findById(projectId);
    if (!project || project.status !== "open") {
      return res.status(400).json({ message: "Project not available" });
    }

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Client views proposals for a project
export const getProposalsByProject = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      project: req.params.projectId
    }).populate("freelancer", "name email");

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Client accepts a proposal
export const acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate("project");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only client can accept proposals" });
    }

    // Update proposal
    proposal.status = "accepted";
    await proposal.save();

    // Reject other proposals
    await Proposal.updateMany(
      { project: proposal.project._id, _id: { $ne: proposal._id } },
      { status: "rejected" }
    );

    // Update project
    proposal.project.status = "in-progress";
    proposal.project.freelancer = proposal.freelancer;
    await proposal.project.save();

    res.json({ message: "Proposal accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
