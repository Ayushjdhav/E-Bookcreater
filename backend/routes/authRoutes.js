const express = require("express");
const router = express.Router();

const { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateUserProfile 
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes (requires authentication token)
router.get("/profile", protect, getProfile);
router.put("/me", protect, updateUserProfile);

module.exports = router;