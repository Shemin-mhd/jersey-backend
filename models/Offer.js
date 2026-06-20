import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        discountPercent: { type: Number, required: true, min: 1, max: 100 },
        discountAmount: { type: Number }, // optional fixed amount
        code: { type: String, unique: true }, // coupon code
        type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
        applicableTo: { type: String, enum: ["all", "category", "product"], default: "all" },
        category: { type: String }, // if applicableTo is category
        productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // if applicableTo is product
        minPurchase: { type: Number, default: 0 }, // minimum purchase amount
        maxDiscount: { type: Number }, // max discount for percentage
        expiresAt: { type: Date },
        active: { type: Boolean, default: true },
        usageLimit: { type: Number }, // total usage limit
        usedCount: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who created
    },
    { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);
export default Offer;