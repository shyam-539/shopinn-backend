require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://shopinn-frontend.onrender.com/"; // Replace with actual frontend URL

// Middleware
app.use(express.json());

// ✅ CORS Configuration (Allows only requests from the frontend)
app.use(
  cors({
    origin: FRONTEND_URL, // Restrict to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Connect to MongoDB with Retry Mechanism
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};
connectDB();

// ✅ API Logging Middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/product"));

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 E-commerce API is running...");
});

// ✅ Global Error Handling (Prevents Server Crashes)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
