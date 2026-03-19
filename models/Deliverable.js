import mongoose from "mongoose";

const deliverableSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: String,
  fileUrl: String,
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.model("Deliverable", deliverableSchema);