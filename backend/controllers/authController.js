const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper: Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d", // Token valid for 7 days
    });
};

//@desc    Register new user
//@route   POST /api/auth/register
//@access  Public
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body; // Fixed comma typo

    try {
        if(!name || !email || !password){
            return res.status(404).json({message: " Please fill all fields"});
        }
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user (password hashing happens automatically via Mongoose middleware)
        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isPro: user.isPro,
                message:"User register successfully",
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc    Login user & get token
//@route   POST /api/auth/login
//@access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user and explicitly select password (since select: false is set in the model)
        const user = await User.findOne({ email }).select("+password");

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isPro: user.isPro,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc    Get current logged-in user profile
//@route   GET /api/auth/profile
//@access  Private (Requires authentication middleware)
exports.getProfile = async (req, res) => {
    try {
        // req.user is populated by your protect middleware
        const user = await User.findById(req.user.id);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc    Update user profile
//@route   PUT /api/auth/me
//@access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            
            if (req.body.password) {
                user.password = req.body.password; // Triggers pre-save hashing hook
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isPro: updatedUser.isPro,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

