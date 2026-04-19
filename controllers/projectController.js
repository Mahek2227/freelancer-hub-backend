import Project from "../models/Project.js";
import { notifyUser } from "../utils/notifyUser.js";

// 🔹 CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      client: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 GET PROJECTS
export const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "client") {
      projects = await Project.find({ client: req.user._id })
        .populate(
          "client",
          "name email profile_picture_url company_name average_rating total_projects_completed"
        )
        .populate(
          "freelancer",
          "name email profile_picture_url hourly_rate average_rating"
        );
    } else {
      projects = await Project.find({
        $or: [{ status: "open" }, { freelancer: req.user._id }],
      })
        .populate(
          "client",
          "name email profile_picture_url company_name average_rating total_projects_completed"
        )
        .populate(
          "freelancer",
          "name email profile_picture_url hourly_rate average_rating"
        );
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 GET PROJECT BY ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate(
        "client",
        "name email profile_picture_url company_name average_rating total_projects_completed total_reviews"
      )
      .populate(
        "freelancer",
        "name email profile_picture_url hourly_rate average_rating skills"
      );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 UPDATE PROJECT (ASSIGN + START + NOTIFICATIONS)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    if (req.body.title) project.title = req.body.title;
    if (req.body.description) project.description = req.body.description;
    if (req.body.budget) project.budget = req.body.budget;

    // 🔥 Assign freelancer
    if (req.body.freelancer) {
      project.freelancer = req.body.freelancer;
    }

    // 🔥 Update status
    if (req.body.status) {
      project.status = req.body.status;
    }

    await project.save();

    // 🔔 Notify freelancer assignment
    if (req.body.freelancer) {
      await notifyUser(
        project.freelancer,
        "Project Assigned 🎯",
        `You have been assigned to project: ${project.title}`
      );
    }

    // 🔔 Notify project start
    if (req.body.status === "in-progress" && project.freelancer) {
      await notifyUser(
        project.freelancer,
        "Project Started 🚀",
        `Project "${project.title}" has started`
      );
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 COMPLETE PROJECT
export const completeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only client can complete the project" });
    }

    if (project.status !== "in-progress") {
      return res.status(400).json({
        message: `Project cannot be completed when status is '${project.status}'`,
      });
    }

    project.status = "completed";
    await project.save();

    // 🔔 Notify freelancer
    if (project.freelancer) {
      await notifyUser(
        project.freelancer,
        "Project Completed 🎉",
        `Project "${project.title}" has been completed`
      );
    }

    res.status(200).json({
      message: "Project marked as completed",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 DELETE PROJECT
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};