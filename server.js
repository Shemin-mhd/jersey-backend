
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


const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@gmail.com" });

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
      console.log(" Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());


app.use("/uploads", express.static("uploads"));


connectDB().then(() => {
  createAdmin();
});


app.use((req, res, next) => {
  if (!getDbStatus() && req.path.startsWith("/api")) {
    return res.status(503).json({
      message:
        "Database connection error. Please ensure your IP is whitelisted in MongoDB Atlas.",
    });
  }
  next();
});


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/offers", offerRoutes);


app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    database: getDbStatus() ? "Connected" : "Disconnected",
    message: "Visit /api/products to see if products are loading",
  });
});


const PORT = process.env.PORT || process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
});

