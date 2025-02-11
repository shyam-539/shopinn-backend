const express = require("express");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Get All Products (Protected)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
