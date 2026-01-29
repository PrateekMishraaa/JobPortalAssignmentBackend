import mongoose, { Schema } from "mongoose";

const JobsSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false,  // Change to false or remove this line
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      required: true,
    },

    experience: {
      type: String,
      enum: ["Fresher", "Junior", "Mid", "Senior"],
      required: true,
    },

    salary: {
      min: Number,
      max: Number,
    },

    skills: [String],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Jobs = mongoose.model("Jobs", JobsSchema);
export default Jobs;