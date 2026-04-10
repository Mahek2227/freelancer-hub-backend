import User from "../models/User.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Multer configuration for memory storage (Cloudinary will handle storage)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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
    console.log('uploadAvatar called');
    console.log('req.file:', req.file ? 'Present' : 'Missing');
    console.log('req.user:', req.user ? 'Authenticated' : 'NOT authenticated');

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "freelancer-hub/avatars",
          public_id: `user_${req.user._id}_${Date.now()}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Update user with Cloudinary URL
    user.profile_picture_url = result.secure_url;
    await user.save();

    console.log('Avatar updated successfully');
    res.status(200).json(user);
  } catch (error) {
    console.error('Avatar upload error:', error.message, error.stack);
    res.status(500).json({ message: error.message || "Avatar upload failed" });
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

export { upload };
