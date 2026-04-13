import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.skills) user.skills = req.body.skills;
    if (req.body.hourly_rate) user.hourly_rate = req.body.hourly_rate;
    if (req.body.portfolio_link) user.portfolio_link = req.body.portfolio_link;
    if (req.body.availability) user.availability = req.body.availability;
    if (req.body.company_name) user.company_name = req.body.company_name;
    if (req.body.company_size) user.company_size = req.body.company_size;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Starting avatar upload for user:", req.user._id);
    console.log("File size:", req.file.size);

    // Upload to Cloudinary using buffer stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        resource_type: "auto",
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Upload failed", error: error.message });
        }

        console.log("Cloudinary upload successful:", result.secure_url);

        try {
          // Update user document with new avatar URL
          const user = await User.findByIdAndUpdate(
            req.user._id,
            { profile_picture_url: result.secure_url },
            { new: true }
          ).select("-password");

          console.log("User updated with avatar URL:", user.profile_picture_url);

          res.json(user);
        } catch (dbError) {
          console.error("Database error:", dbError);
          res.status(500).json({ message: "Failed to update profile", error: dbError.message });
        }
      }
    );

    // Pipe the file buffer to Cloudinary
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query, role } = req.query;

    let filter = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { skills: { $in: [query] } },
      ];
    }
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password")
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
