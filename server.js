require("dotenv").config();

const express = require("express");

const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();


// Connect Database
connectDB();


// Middleware
app.use(express.json());


// Home Route
app.get("/", (req, res) => {
    res.send("Inventory Management API is Running!");
});


// Product Routes
app.use("/api/products", productRoutes);


// Handle Invalid Routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});


// Centralized Error Handling
app.use(errorMiddleware);


// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});