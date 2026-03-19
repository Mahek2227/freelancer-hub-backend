
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed","closed"],
      default: "open"
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    delivery: {
  message: String,
  link: String,
  submittedAt: Date
},
  },
  { timestamps: true }
);


export default mongoose.model("Project", projectSchema);
