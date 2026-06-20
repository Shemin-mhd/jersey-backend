import express from "express";
import { getCart, updateCart } from "../controllers/cartController.js";

const router = express.Router();

router.get("/", getCart);
router.patch("/:id", updateCart);

export default router;
