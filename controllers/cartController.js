import mongoose from "mongoose";
import User from "../models/User.js";

export const getCart = async (req, res) => {
    try {
        if (!req.query.userId || !mongoose.Types.ObjectId.isValid(req.query.userId)) {
            return res.status(400).json({ message: "Valid UserId is required" });
        }

        const user = await User.findById(req.query.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json([{
            userId: user._id,
            items: user.cart || []
        }]);
    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateCart = async (req, res) => {
    try {
        console.log("Updating cart for user:", req.params.id);
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const items = req.body.items || [];
        console.log("Items received:", items.length);

        user.cart = items.map(item => {
            const prodId = item._id || item.id;
            return {
                productId: mongoose.Types.ObjectId.isValid(prodId) ? prodId : null,
                quantity: Number(item.quantity) || 1,
                size: item.size || "N/A",
                sizes: item.sizes || ["S", "M", "L", "XL"],
                team: item.team || item.name || "Unknown Item",
                price: Number(item.price) || 0,
                image: item.image,
                category: item.category
            };
        }).filter(item => item.productId !== null);

        await user.save();
        console.log("Cart saved successfully");
        res.json([{
            userId: user._id,
            items: user.cart
        }]);
    } catch (error) {
        console.error("Update Cart Error detailed:", error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};
