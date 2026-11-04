require("dotenv").config();
console.log("DB USER:", process.env.DB_USER);
console.log("DB NAME:", process.env.DB_NAME);
console.log("DB PASSWORD EXISTS:", !!process.env.DB_PASSWORD);
const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("select 1 as OK");
    res.json({
      success: true,
      message: "API and database working",
      data: rows[0],
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

//TEMPORARY CODE
const { protect, authorize } = require('./middleware/authMiddleware');
app.get('/api/test/admin', protect, authorize('admin'), (req, res) =>
  res.json({ success: true, message: 'Hello admin' })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
