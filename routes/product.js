const express = require("express");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ✅ Get All Products (Protected Route)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    
    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
