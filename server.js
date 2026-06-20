import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";

import connectDB, { getDbStatus } from "./config/db.js";
import User from "./models/User.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://jersey-frontend-seven.vercel.app", // Replace this
    ],
    credentials: true,
  })
);

app.use(express.json());

// Static Uploads
app.use("/uploads", express.static("uploads"));

// Create Default Admin
const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      email: "admin@gmail.com",
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Default Admin Created");
    } else {
      console.log("✅ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

// Connect MongoDB
connectDB().then(() => {
  createAdmin();
});

// DB Status Check
app.use((req, res, next) => {
  if (!getDbStatus() && req.path.startsWith("/api")) {
    return res.status(503).json({
      message: "Database connection error",
    });
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/offers", offerRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    database: getDbStatus() ? "Connected" : "Disconnected",
    message: "Visit /api/products to test API",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

