require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/collector", require("./routes/collectorRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/wastetypes", require("./routes/wasteTypeRoutes"));
app.use("/api/areas", require("./routes/areaRoutes"));

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("select 1 as OK");
    res.json({
      success: true,
      message: "API and database working",
      data: rows[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
