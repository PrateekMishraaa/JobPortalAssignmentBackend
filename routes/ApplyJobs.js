import express from "express";
import Applyjobs from "../models/Apply.js";
import upload from "../middleware/Multer.js";

const router = express.Router();

// Apply for job with resume upload
router.post('/applyjobs/:jobId', upload.single('resume'), async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        console.log("Request params:", req.params);
        
        const { fullname, email, mobile, coverLetter } = req.body;
        const { jobId } = req.params;
        
        // Check if jobId exists in params
        if (!jobId) {
            return res.status(400).json({ 
                message: "Job ID is required in URL" 
            });
        }

        // Validate required fields
        if (!fullname || !email || !mobile || !coverLetter) {
            return res.status(400).json({ 
                message: "All fields are required" 
            });
        }

        // Validate mobile number
        if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
            return res.status(400).json({ 
                message: "Mobile number should be exactly 10 digits" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: "Please enter a valid email address" 
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ 
                message: "Resume file is required" 
            });
        }

        // Check if user has already applied for this job with same email
        const existingApplication = await Applyjobs.findOne({
            jobs: jobId,
            email: email.toLowerCase().trim()
        });

        if (existingApplication) {
            return res.status(400).json({ 
                message: "You have already applied for this job with this email" 
            });
        }

        // Create new application
        const newApplication = new Applyjobs({
            jobs: jobId,
            fullname: fullname.trim(),
            email: email.toLowerCase().trim(),
            mobile: mobile.trim(),
            coverLetter: coverLetter.trim(),
            resume: req.file.path // Save file path from multer
        });

        // Save to database
        await newApplication.save();

        // Optionally, you can populate the job details
        const applicationWithJob = await Applyjobs.findById(newApplication._id)
            .populate('jobs', 'title company');

        console.log("✅ Job application submitted successfully:", newApplication._id);
        
        return res.status(201).json({
            success: true,
            message: "Job application submitted successfully",
            application: {
                id: newApplication._id,
                jobId: jobId,
                fullname: newApplication.fullname,
                email: newApplication.email,
                resumeUrl: `/uploads/${req.file.filename}`, // Public URL
                appliedAt: newApplication.createdAt
            }
        });

    } catch (error) {
        console.error("❌ Error submitting job application:", error);
        
        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false,
                message: "File size too large. Maximum size is 5MB" 
            });
        }
        
        if (error.name === 'MulterError') {
            return res.status(400).json({ 
                success: false,
                message: "File upload error" 
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ 
                success: false,
                message: "Validation error",
                errors 
            });
        }
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: "Duplicate application found" 
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
});

// Get all applications for a specific job
router.get('/applications/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        
        const applications = await Applyjobs.find({ jobs: jobId })
            .populate('jobs', 'title company location')
            .select('-__v')
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
});

// Get single application
router.get('/application/:applicationId', async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        const application = await Applyjobs.findById(applicationId)
            .populate('jobs', 'title company location description');
            
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }
            
        return res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        console.error("Error fetching application:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
});

export default router;