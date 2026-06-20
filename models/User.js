import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        blocked: { type: Boolean, default: false },
        cart: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                quantity: { type: Number, default: 1 },
                size: { type: String },
                sizes: [String],
                team: String,
                price: Number,
                image: String,
                category: String



            }
        ],
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        offers: [
            {
                title: { type: String, required: true },
                discountPercent: { type: Number, required: true },
                expiresAt: { type: Date },
                active: { type: Boolean, default: true },
                createdAt: { type: Date, default: Date.now }
            }
        ],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
