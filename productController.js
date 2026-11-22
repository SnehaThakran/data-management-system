const Product = require("../models/Product");

// 1. CREATE PRODUCT
exports.createProduct = async (req, res, next) => {
    try {

        const product = await Product.create(req.body);

        res.status(201).json(product);

    } catch (error) {
        next(error);
    }
};


// 2. GET ALL PRODUCTS
exports.getProducts = async (req, res, next) => {
    try {

        const {
            category,
            search,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        // Category filtering
        if (category) {
            filter.category = new RegExp(
                `^${category}$`, "i"
            );
        }

        // Search by product name
        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        // Price filtering
        if (minPrice !== undefined || maxPrice !== undefined) {

            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        const pageNumber = Math.max(1, Number(page));
        const pageLimit = Math.min(
            100,
            Math.max(1, Number(limit))
        );

        const skip = (pageNumber - 1) * pageLimit;

        // Sorting
        let sortOption = {};

        if (sort === "price") {
            sortOption.price = 1;
        } else if (sort === "-price") {
            sortOption.price = -1;
        } else {
            sortOption.createdAt = -1;
        }

        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(pageLimit);

        res.status(200).json({
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / pageLimit),
            count: products.length,
            products
        });

    } catch (error) {
        next(error);
    }
};


// 3. GET SINGLE PRODUCT
exports.getProductById = async (req, res, next) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        next(error);
    }
};


// 4. UPDATE PRODUCT
exports.updateProduct = async (req, res, next) => {
    try {

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        next(error);
    }
};


// 5. DELETE PRODUCT
exports.deleteProduct = async (req, res, next) => {
    try {

        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted",
            id: product._id
        });

    } catch (error) {
        next(error);
    }
};


// 6. LOW STOCK REPORT
exports.getLowStockProducts = async (req, res, next) => {
    try {

        const products = await Product.find({
            $expr: {
                $lte: ["$quantity", "$reorderLevel"]
            }
        });

        res.status(200).json({
            count: products.length,
            lowStockItems: products
        });

    } catch (error) {
        next(error);
    }
};


// 7. CATEGORY-WISE INVENTORY SUMMARY
exports.getInventorySummary = async (req, res, next) => {
    try {

        const summary = await Product.aggregate([

            {
                $group: {
                    _id: "$category",

                    totalItems: {
                        $sum: 1
                    },

                    totalQuantity: {
                        $sum: "$quantity"
                    },

                    totalStockValue: {
                        $sum: {
                            $multiply: [
                                "$price",
                                "$quantity"
                            ]
                        }
                    },

                    avgPrice: {
                        $avg: "$price"
                    }
                }
            },

            {
                $sort: {
                    _id: 1
                }
            }

        ]);

        res.status(200).json({
            categories: summary.length,
            summary
        });

    } catch (error) {
        next(error);
    }
};


// 8. RESTOCK AND SALE OPERATIONS
exports.updateStock = async (req, res, next) => {
    try {

        const change = req.body.change;

        if (
            !Number.isInteger(change) ||
            change === 0
        ) {
            return res.status(400).json({
                message: "Change must be a non-zero integer"
            });
        }

        const filter = {
            _id: req.params.id
        };

        // Prevent stock from becoming negative
        if (change < 0) {
            filter.quantity = {
                $gte: Math.abs(change)
            };
        }

        const product = await Product.findOneAndUpdate(
            filter,
            {
                $inc: {
                    quantity: change
                }
            },
            {
                new: true
            }
        );

        if (!product) {

            const exists = await Product.exists({
                _id: req.params.id
            });

            return res.status(exists ? 400 : 404).json({
                message: exists
                    ? "Insufficient stock"
                    : "Product not found"
            });
        }

        res.status(200).json({
            message: "Stock updated successfully",
            product
        });

    } catch (error) {
        next(error);
    }
};