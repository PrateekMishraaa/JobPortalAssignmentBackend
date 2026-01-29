import express from "express";
const router = express.Router();
import Jobs from "../models/Jobs.js";

// Create job for a specific user (user ID in params)
router.post("/jobslist/:userId", async (req, res) => {
  try {
    const { userId } = req.params;  // Get user ID from URL params
    
    const {
      title,
      description,
      location,
      jobType,
      experience,
      salary,
      skills,
      isActive,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !jobType ||
      !experience ||
      !salary?.min ||
      !salary?.max ||
      !skills?.length
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const job = await Jobs.create({
      user: userId,  // Use userId from params
      title,
      description,
      location,
      jobType,
      experience,
      salary,
      skills,
      isActive: isActive ?? true,
    });

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Job creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/jobs", async (req, res) => {
  const {
    title,
    description,
    location,
    jobType,
    experience,
    salary,
    skills,
    isActive
  } = req.body;

  // ✅ validation exactly according to payload
  if (
    !title ||
    !description ||
    !location ||
    !jobType ||
    !experience ||
    !salary ||
    typeof salary.min !== "number" ||
    typeof salary.max !== "number" ||
    !Array.isArray(skills) ||
    skills.length === 0 ||
    typeof isActive !== "boolean"
  ) {
    return res.status(400).json({
      message: "all fields are required for job list"
    });
  }

  try {
    const isJobExist = await Jobs.findOne({ title });

    if (isJobExist) {
      return res.status(409).json({
        message: "This job is already register"
      });
    }

    const newJob = await Jobs.create({
      title,
      description,
      location,
      jobType,
      experience,
      salary,
      skills,
      isActive
    });

    return res.status(201).json({
      message: "Job created successfully",
      job: newJob
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Get all jobs for a specific user
router.get("/jobslist/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const jobs = await Jobs.find({ user: userId })
      .populate("user", "name email")  // Optional: populate user details
      .sort({ createdAt: -1 });  // Sort by newest first

    res.status(200).json({
      message: "Jobs retrieved successfully",
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/alljobs",async(req,res)=>{
  try{
    const jobsdata = await Jobs.find()
    console.log("all jobs",jobsdata)
    return res.status(200).json({message:"All jobs",jobsdata})
  }catch(error){
    console.log("error",error)
    return res.status(500).json({message:"Internal server error",error})
  }
})
router.get("/jobslist", async (req, res) => {
  try {
    const jobs = await Jobs.find({ isActive: true })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Jobs retrieved successfully",
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;