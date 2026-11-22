const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getInventorySummary,
    updateStock
} = require("../controllers/productController");


// CREATE PRODUCT
router.post("/", createProduct);


// GET ALL PRODUCTS
router.get("/", getProducts);


// LOW STOCK REPORT
router.get("/low-stock", getLowStockProducts);


// CATEGORY SUMMARY
router.get("/summary", getInventorySummary);


// UPDATE STOCK
router.patch("/:id/stock", updateStock);


// GET SINGLE PRODUCT
router.get("/:id", getProductById);


// UPDATE PRODUCT
router.put("/:id", updateProduct);


// DELETE PRODUCT
router.delete("/:id", deleteProduct);


module.exports = router;