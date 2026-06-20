import express from "express";
import {
    addOffer,
    removeOffer,
    getUserOffers,
    getAllUsersWithOffers,
    getGlobalOffers,
    createGlobalOffer,
    updateGlobalOffer,
    deleteGlobalOffer,
    getAllGlobalOffers,
    applyOfferCode,
} from "../controllers/offerController.js";
import protect from "../middleware/authmiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// User-specific offers (existing)
router.get("/", protect, admin, getAllUsersWithOffers);
router.get("/:userId", protect, admin, getUserOffers);
router.post("/:userId", protect, admin, addOffer);
router.delete("/:userId/:offerId", protect, admin, removeOffer);

// Global offers
router.get("/global", getGlobalOffers); // public
router.post("/global", protect, admin, createGlobalOffer);
router.put("/global/:id", protect, admin, updateGlobalOffer);
router.delete("/global/:id", protect, admin, deleteGlobalOffer);
router.get("/global/admin", protect, admin, getAllGlobalOffers);

// Apply offer code
router.post("/apply", protect, applyOfferCode);

export default router;
