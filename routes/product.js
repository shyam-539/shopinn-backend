const express = require("express");
const Product = require("../models/Product");
const { authenticateToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * @route GET /api/products
 * @desc Get all products (with filters, search, sorting, and pagination)
 */
router.get("/", async (req, res) => {
  try {
    let { category, minPrice, maxPrice, search, sortBy, order, page, limit } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (search) filter.name = { $regex: search, $options: "i" }; // Case-insensitive search

    let sort = {};
    if (sortBy) sort[sortBy] = order === "desc" ? -1 : 1;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);

    res.json({ total, page, limit, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/products/:id
 * @desc Get a single product by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/products
 * @desc Create a new product (Admin only)
 */
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, rating, image } = req.body;
    const product = new Product({ name, description, price, category, stock, rating, image });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PUT /api/products/:id
 * @desc Update a product by ID (Admin only)
 */
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, rating, image } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, stock, rating, image },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product by ID (Admin only)
 */
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
