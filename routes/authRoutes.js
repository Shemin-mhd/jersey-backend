import express from "express";
import { register, login, getUsers, updateUser, deleteUser } from "../controllers/authController.js";
import protect from "../middleware/authmiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", protect, admin, getUsers);
router.patch("/users/:id", protect, admin, updateUser);
router.delete("/users/:id", protect, admin, deleteUser);

export default router;
