import Project from "../models/Project.js";


export const createProject = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      client: req.user._id
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "client") {
      // Client sees their projects
      projects = await Project.find({
        client: req.user._id,
      })
        .populate("client", "name email profile_picture_url company_name average_rating total_projects_completed")
        .populate("freelancer", "name email profile_picture_url hourly_rate average_rating");
        
        

    } else if (req.user.role === "freelancer") {
      // Freelancer sees open projects + assigned projects
      projects = await Project.find({
        $or: [
          { status: "open" },
          { freelancer: req.user._id }
        ]
      })
        .populate("client", "name email profile_picture_url company_name average_rating total_projects_completed")
        .populate("freelancer", "name email profile_picture_url hourly_rate average_rating");
        
    }

    res.status(200).json(projects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name email profile_picture_url company_name average_rating total_projects_completed total_reviews")
      .populate("freelancer", "name email profile_picture_url hourly_rate average_rating skills");
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeProject = async (req, res) => {
  try {
    // 1. Find project
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2. Only client can complete the project
    if (project.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only client can complete the project" });
    }

    // 3. Project must be in-progress
    if (project.status !== "in-progress") {
      return res.status(400).json({
        message: `Project cannot be completed when status is '${project.status}'`,
      });
    }

    // 4. Update status
    project.status = "completed";

    // 5. Save
    await project.save();

    res.status(200).json({
      message: "Project marked as completed",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only client can update their project
    if (project.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this project" });
    }

    // Update fields
    if (req.body.title) project.title = req.body.title;
    if (req.body.description) project.description = req.body.description;
    if (req.body.budget) project.budget = req.body.budget;
    if (req.body.status) project.status = req.body.status;

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only client can delete their project
    if (project.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

