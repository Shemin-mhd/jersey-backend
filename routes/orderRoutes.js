import express from "express";
import { createOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelOrder } from "../controllers/orderController.js";
import protect from "../middleware/authmiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", createOrder); // No protect to allow guest orders
router.get("/", protect, admin, getAllOrders);
router.get("/user", protect, getUserOrders);
router.patch("/:id", protect, admin, updateOrderStatus);
router.get("/my", protect, getUserOrders);
router.put("/:id/cancel", protect, cancelOrder);



export default router; 
