const express = require("express");
const router = express.Router();

const {
  getAreas,
  getAllAreas,
  createArea,
  updateArea,
  updateAreaStatus,
} = require("../controllers/areaController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public: Only active areas for booking dropdown
router.get("/", getAreas);

// Admin-only area management
router.get("/admin", protect, authorize("admin"), getAllAreas);
router.post("/", protect, authorize("admin"), createArea);
router.put("/:id", protect, authorize("admin"), updateArea);
router.patch("/:id/status", protect, authorize("admin"), updateAreaStatus);

module.exports = router;