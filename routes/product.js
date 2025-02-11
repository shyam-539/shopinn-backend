const express = require("express");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ✅ Get All Products (Protected Route)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Extract page and limit from query parameters, with defaults
    const { page = 1, limit = 10 } = req.query;
    
    // Fetch products with pagination
    const products = await Product.find()
      .skip((page - 1) * limit) // Skip items based on current page
      .limit(limit); // Limit the number of products returned

    // Check if products were found
    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    // Get total product count for pagination info
    const totalCount = await Product.countDocuments();

    // Send response with products and pagination info
    res.json({
      products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
