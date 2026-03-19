import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["client", "freelancer"],
    default: "client",
  },
  // Profile Information
  profile_picture_url: { type: String, default: null },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  
  // Freelancer-specific fields
  skills: [{ type: String }], // e.g., ["React", "Node.js", "UI Design"]
  hourly_rate: { type: Number, default: null },
  portfolio_link: { type: String, default: "" },
  availability: {
    type: String,
    enum: ["available", "busy", "unavailable"],
    default: "available"
  },
  
  // Client-specific fields
  company_name: { type: String, default: "" },
  company_size: { type: String, default: "" },
  
  // Rating & Reviews
  average_rating: { type: Number, default: 0, min: 0, max: 5 },
  total_reviews: { type: Number, default: 0 },
  total_projects_completed: { type: Number, default: 0 },
  
  // Account info
  is_verified: { type: Boolean, default: false },
  stripe_account_id: { type: String, default: null },
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
