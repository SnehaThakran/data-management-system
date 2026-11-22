const errorMiddleware = (err, req, res, next) => {

    console.log(err);

    let statusCode = 500;
    let message = "Internal Server Error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    // Invalid MongoDB ID
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID";
    }

    // Duplicate SKU
    if (err.code === 11000) {
        statusCode = 409;
        message = "SKU already exists";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorMiddleware;