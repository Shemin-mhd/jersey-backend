import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;
        let query = {};

        // --- Search Logic ---
        if (search) {
            const searchRegex = new RegExp(search, "i");
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { team: searchRegex } // Assuming 'team' is a field in your Product model
            ];
        }

        // --- Filter Logic ---
        if (category && category !== "All") {
            // Use case-insensitive regex for category matching
            query.category = new RegExp(`^${category}$`, "i");
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // --- Sort Logic ---
        let sortOptions = { createdAt: -1 }; // Default: Newest first

        if (sort === "price_low") {
            sortOptions = { price: 1 };
        } else if (sort === "price_high") {
            sortOptions = { price: -1 };
        } else if (sort === "oldest") {
            sortOptions = { createdAt: 1 };
        } else if (sort === "name_asc") {
            sortOptions = { name: 1 };
        } else if (sort === "name_desc") {
            sortOptions = { name: -1 };
        }

        // --- Pagination Logic ---
        const isAll = req.query.all === 'true';
        let products;
        let totalProducts = await Product.countDocuments(query);
        let totalPages = 1;
        let currentPageResult = 1;

        if (isAll) {
            products = await Product.find(query).sort(sortOptions);
            totalPages = 1;
            currentPageResult = 1;
        } else {
            const skip = (Number(page) - 1) * Number(limit);
            products = await Product.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit));
            totalPages = Math.ceil(totalProducts / Number(limit));
            currentPageResult = Number(page);
        }

        res.json({
            products,
            totalProducts,
            totalPages,
            currentPage: currentPageResult
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (product) {
            res.json({ message: "Product deleted" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// import Product from "../models/Product.js";

// // CREATE
// export const createProduct = async (req, res) => {
//     try {
//         const product = new Product(req.body);
//         const saved = await product.save();
//         res.status(201).json(saved);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // UPDATE
// export const updateProduct = async (req, res) => {
//     try {
//         const updated = await Product.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );
//         res.json(updated);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // DELETE
// export const deleteProduct = async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // GET ALL
// export const getProducts = async (req, res) => {
//     try {
//         const products = await Product.find();
//         res.json(products);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


