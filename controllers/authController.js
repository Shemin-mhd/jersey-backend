import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken, generateRefreshToken } from "../config/jwt.js";

export const register = async (req, res) => {
    
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields (name, email, password) are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
        // Case-insensitive search
        const userExists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    console.log(`Login attempt for: ${email}`);

    try {
        // Case-insensitive search
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });

        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Password mismatch for: ${email}`);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (user.blocked) return res.status(403).json({ message: "Account blocked" });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            refreshToken: generateRefreshToken(user._id),
        });
    } catch (error) {
        console.error("Login Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    try {
        const query = {
            role: "user",
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        };

        const isAll = req.query.all === 'true';
        let users;
        const totalUsers = await User.countDocuments(query);
        let totalPages = 1;
        let currentPageResult = 1;

        if (isAll) {
            users = await User.find(query)
                .select("-password")
                .sort({ createdAt: -1 });
        } else {
            users = await User.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            totalPages = Math.ceil(totalUsers / limit);
            currentPageResult = page;
        }

        res.json({
            users,
            currentPage: currentPageResult,
            totalPages: totalPages,
            totalUsers,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            res.json({ message: "User deleted" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
