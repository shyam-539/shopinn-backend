const express = require("express");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  console.log('Getting products...'); // Debug log
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    const totalCount = await Product.countDocuments();

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
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