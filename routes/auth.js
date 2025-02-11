const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ✅ User Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body; // Default role to "user"

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Convert email to lowercase to avoid duplicates
    const normalizedEmail = email.toLowerCase();

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const user = new User({ name, email: normalizedEmail, password: hashedPassword, role });
    await user.save();

    // ✅ Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // ✅ Send JSON response with user details
    res.status(201).json({ message: "User registered successfully", token, user: { name, email: user.email, role } });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
