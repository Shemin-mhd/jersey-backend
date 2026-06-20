import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                team: String,
                price: Number,
                quantity: Number,
                size: String,
                image: String,
            },
        ],
        total: { type: Number, required: true },
        subtotal: { type: Number },
        discount: { type: Number, default: 0 },
        appliedOffer: {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
            title: String,
            code: String,
            discountPercent: Number,
            discountAmount: Number,
            type: String,
        },
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String },
        paymentMethod: { type: String, required: true }, 
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Cancellation Requested"],
            default: "Pending",
        },

        isDelivered: {
            type: Boolean,
            default: false,
        },

        deliveredAt: {
            type: Date,
        },

        cancelReason: {
            type: String,
        },

        cancelledAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
