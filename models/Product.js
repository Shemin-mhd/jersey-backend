import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        team: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        image: { type: String, required: true },
        backImage: { type: String },
        description: { type: String },
        sizes: [String],
        quantity: { type: Number, default: 0 },
        salePrice: { type: Number },
        offerExpiry: { type: Date },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
