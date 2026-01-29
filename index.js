import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apply from "./routes/ApplyJobs.js"
import User from "./routes/Users.js";
import Job from "./routes/Jobs.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
import fs from "fs";
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
}

// CORS Configuration
app.use(cors({
    origin: "https://moonlit-palmier-a911f6.netlify.app", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parsers - IMPORTANT for form-data
app.use(express.json()); // For JSON data
app.use(express.urlencoded({ extended: true })); // For URL-encoded data

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', User);
app.use('/api', Job);
app.use('/api', apply);

// Test route for file uploads
app.get('/api/test-upload', (req, res) => {
    res.json({
        message: "File upload endpoint is working",
        uploadPath: "/uploads",
        maxFileSize: "5MB",
        allowedTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"]
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "Job Portal API",
        uploadsDirectory: fs.existsSync(uploadsDir) ? "Exists" : "Missing"
    });
});

app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Job Portal API",
        endpoints: {
            user: "/api/users/*",
            jobs: "/api/jobs/*",
            apply: "/api/applyjobs/*",
            uploads: "/uploads/{filename}",
            health: "/api/health"
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    
    // Handle multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: "File too large",
                message: "File size should be less than 5MB"
            });
        }
        return res.status(400).json({
            error: "File upload error",
            message: err.message
        });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: "Validation Error",
            message: err.message
        });
    }
    
    // Handle other errors
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message || "Something went wrong"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.originalUrl} not found`
    });
});

// DB Connection with improved error handling
mongoose.connect(process.env.MONGOURI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
.then(() => {
    console.log("✅ Database connected successfully");
    
    // Start server only after DB connection
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`📁 Uploads directory: ${uploadsDir}`);
        console.log(`🔗 Uploads URL: http://localhost:${PORT}/uploads/`);
        console.log(`🌐 Frontend URL: http://localhost:5173`);
    });
})
.catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});