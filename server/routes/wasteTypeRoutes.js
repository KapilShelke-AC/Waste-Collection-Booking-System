const express = require("express");
const router = express.Router();

const {
  getWasteTypes,
  getAllWasteTypes,
  createWasteType,
  updateWasteType,
  deleteWasteType,
} = require("../controllers/wasteTypeController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public: Get active waste types
router.get("/", getWasteTypes);

// Admin: Manage waste types
router.get("/admin", protect, authorize("admin"), getAllWasteTypes);
router.post("/", protect, authorize("admin"), createWasteType);
router.put("/:id", protect, authorize("admin"), updateWasteType);
router.delete("/:id", protect, authorize("admin"), deleteWasteType);

module.exports = router;