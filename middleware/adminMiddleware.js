import User from "../models/User.js";

const admin = async (req, res, next) => {
    if (req.user && req.user.id) {
        try {
            const user = await User.findById(req.user.id);
            if (user && user.role === "admin") {
                return next();
            }
            return res.status(403).json({ message: "Not authorized as an admin" });
        } catch (error) {
            return res.status(500).json({ message: "Error checking admin status" });
        }
    }
    return res.status(401).json({ message: "Not authorized, no admin token" });
};

export default admin;
