require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// Member 1: Authentication and user management
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/collector", require("./routes/collectorRoutes"));

// Member 2: Booking and waste management
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/wastetypes", require("./routes/wasteTypeRoutes"));
app.use("/api/areas", require("./routes/areaRoutes"));

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS OK");

    return res.status(200).json({
      success: true,
      message: "API and database working",
      data: rows[0],
    });
  } catch (error) {
    console.error("Health check error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Temporary admin authentication test
const { protect, authorize } = require("./middleware/authMiddleware");

app.get(
  "/api/test/admin",
  protect,
  authorize("admin"),
  (req, res) => {
    return res.json({
      success: true,
      message: "Hello admin",
    });
  }
);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
