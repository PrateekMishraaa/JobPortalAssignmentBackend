import mongoose, { Schema } from "mongoose";

const ApplySchema = new Schema(
  {
    jobs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobs",
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      minlength: [10, "Phone number should be atleast in 10 digits"],
      maxlength: [10, "Phone number should not be more than 10 digits"],
    },
    coverLetter: {
      type: String,
    },
    resume: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
const Applyjobs = mongoose.model("ApplicationSubmission", ApplySchema);
export default Applyjobs;
