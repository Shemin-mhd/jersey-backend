import User from "../models/User.js";
import Offer from "../models/Offer.js";

// POST /api/offers/:userId  – add an offer to a specific user
export const addOffer = async (req, res) => {
    const { title, discountPercent, expiresAt } = req.body;

    if (!title || !discountPercent) {
        return res.status(400).json({ message: "Title and discountPercent are required" });
    }

    if (discountPercent < 1 || discountPercent > 100) {
        return res.status(400).json({ message: "Discount must be between 1 and 100" });
    }

    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newOffer = {
            title,
            discountPercent,
            expiresAt: expiresAt || null,
            active: true,
        };

        user.offers.push(newOffer);
        await user.save();

        const added = user.offers[user.offers.length - 1];
        res.status(201).json({ message: "Offer added successfully", offer: added });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/offers/:userId/:offerId  – remove offer from a user
export const removeOffer = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const offerIndex = user.offers.findIndex(
            (o) => o._id.toString() === req.params.offerId
        );

        if (offerIndex === -1) {
            return res.status(404).json({ message: "Offer not found" });
        }

        user.offers.splice(offerIndex, 1);
        await user.save();

        res.json({ message: "Offer removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/offers  – get all users who have at least one offer (admin overview)
export const getAllUsersWithOffers = async (req, res) => {
    try {
        const users = await User.find({ "offers.0": { $exists: true } })
            .select("name email offers")
            .sort({ createdAt: -1 });

        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/offers/:userId  – get all offers for a specific user
export const getUserOffers = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("name email offers");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ user: { _id: user._id, name: user.name, email: user.email }, offers: user.offers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Global offer functions

// GET /api/offers/global - get all active global offers
export const getGlobalOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ active: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ offers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/offers/global - create a new global offer (admin only)
export const createGlobalOffer = async (req, res) => {
    const { title, description, discountPercent, discountAmount, code, type, applicableTo, category, productIds, minPurchase, maxDiscount, expiresAt, usageLimit } = req.body;

    if (!title || (!discountPercent && !discountAmount)) {
        return res.status(400).json({ message: "Title and discount (percent or amount) are required" });
    }

    if (discountPercent && (discountPercent < 1 || discountPercent > 100)) {
        return res.status(400).json({ message: "Discount percent must be between 1 and 100" });
    }

    try {
        const newOffer = new Offer({
            title,
            description,
            discountPercent,
            discountAmount,
            code,
            type: type || 'percentage',
            applicableTo: applicableTo || 'all',
            category,
            productIds,
            minPurchase,
            maxDiscount,
            expiresAt,
            usageLimit,
            createdBy: req.user._id
        });

        await newOffer.save();
        res.status(201).json({ message: "Offer created successfully", offer: newOffer });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Offer code already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/offers/global/:id - update a global offer (admin only)
export const updateGlobalOffer = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const offer = await Offer.findByIdAndUpdate(id, updates, { new: true });
        if (!offer) return res.status(404).json({ message: "Offer not found" });

        res.json({ message: "Offer updated successfully", offer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/offers/global/:id - delete a global offer (admin only)
export const deleteGlobalOffer = async (req, res) => {
    const { id } = req.params;

    try {
        const offer = await Offer.findByIdAndDelete(id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });

        res.json({ message: "Offer deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/offers/global/admin - get all global offers for admin (admin only)
export const getAllGlobalOffers = async (req, res) => {
    try {
        const offers = await Offer.find({})
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ offers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/offers/apply - apply an offer code
export const applyOfferCode = async (req, res) => {
    const { code, cartTotal, productIds } = req.body;

    try {
        const offer = await Offer.findOne({ code, active: true });

        if (!offer) {
            return res.status(404).json({ message: "Invalid or inactive offer code" });
        }

        if (offer.expiresAt && new Date() > offer.expiresAt) {
            return res.status(400).json({ message: "Offer has expired" });
        }

        if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
            return res.status(400).json({ message: "Offer usage limit reached" });
        }

        if (cartTotal < offer.minPurchase) {
            return res.status(400).json({ message: `Minimum purchase of $${offer.minPurchase} required` });
        }

        // Check applicability
        let applicable = false;
        if (offer.applicableTo === 'all') {
            applicable = true;
        } else if (offer.applicableTo === 'category') {
            // Would need to check if cart has products from that category
            // For now, assume applicable
            applicable = true;
        } else if (offer.applicableTo === 'product') {
            applicable = productIds.some(id => offer.productIds.includes(id));
        }

        if (!applicable) {
            return res.status(400).json({ message: "Offer not applicable to your cart" });
        }

        // Calculate discount
        let discount = 0;
        if (offer.type === 'percentage') {
            discount = (cartTotal * offer.discountPercent) / 100;
            if (offer.maxDiscount && discount > offer.maxDiscount) {
                discount = offer.maxDiscount;
            }
        } else {
            discount = offer.discountAmount;
        }

        res.json({
            offer: {
                _id: offer._id,
                title: offer.title,
                discountPercent: offer.discountPercent,
                discountAmount: offer.discountAmount,
                type: offer.type,
                maxDiscount: offer.maxDiscount
            },
            discount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
